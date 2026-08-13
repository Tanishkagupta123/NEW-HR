const db = require('../configer/db');

function ensureTable(cb) {
  const create = `CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255),
    sender_name VARCHAR(255),
    sender_role VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  db.query(create, cb);
}

exports.getHistory = async (req, res) => {
  const { room } = req.query;
  if (!room) return res.status(400).json({ error: 'room required' });

  try {
    const allowed = await chatRoomAccessAllowed(req, room);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied for this room' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }

  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT * FROM chat_messages WHERE room = ? ORDER BY created_at ASC', [room], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
};

exports.postMessage = async (req, res) => {
  const { room, senderId, senderName, senderRole, message } = req.body;
  if (!room || !message) return res.status(400).json({ error: 'room and message required' });

  try {
    const allowed = await chatRoomAccessAllowed(req, room, senderId);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied for this room' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }

  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    const payload = [room, senderId || null, senderName || null, senderRole || null, message];
    db.query('INSERT INTO chat_messages (room, sender_id, sender_name, sender_role, message) VALUES (?,?,?,?,?)', payload, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      db.query('SELECT * FROM chat_messages WHERE id = ?', [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2 });
        // emit saved message to room so connected socket clients receive it in real-time
        try {
          if (global.io && rows[0]) {
            global.io.to(rows[0].room).emit('receiveMessage', rows[0]);
          }
        } catch (emitErr) {
          console.error('Emit error in postMessage:', emitErr);
        }
        res.json(rows[0]);
      });
    });
  });
};

exports.saveMessageSocket = (msg) => {
  return new Promise((resolve, reject) => {
    const { room, senderId, senderName, senderRole, message } = msg;
    ensureTable((err) => {
      if (err) return reject(err);
      const payload = [room, senderId || null, senderName || null, senderRole || null, message];
      db.query('INSERT INTO chat_messages (room, sender_id, sender_name, sender_role, message) VALUES (?,?,?,?,?)', payload, (err2, result) => {
        if (err2) return reject(err2);
        db.query('SELECT * FROM chat_messages WHERE id = ?', [result.insertId], (err3, rows) => {
          if (err3) return reject(err3);
          resolve(rows[0]);
        });
      });
    });
  });
};

function ensureGroupsTable(cb) {
  const create = `CREATE TABLE IF NOT EXISTS chat_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    members TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  db.query(create, cb);
}

const getRequesterId = (req) => {
  if (!req.user) return '';
  return req.user.role === 'admin' ? 'admin' : String(req.user.id || '');
};

const isGroupRoom = (room) => String(room || '').startsWith('group_');

const groupAccessAllowed = (req, group) => {
  if (!group) return false;
  if (req.user?.role === 'admin') return true;
  const requesterId = getRequesterId(req);
  if (!requesterId) return false;
  if (String(group.created_by) === requesterId) return true;
  try {
    const members = JSON.parse(group.members || '[]');
    return Array.isArray(members) && members.map(String).includes(requesterId);
  } catch (e) {
    return false;
  }
};

const chatRoomAccessAllowed = (req, room, senderId = null) => {
  if (req.user?.role === 'admin') return true;
  const requesterId = getRequesterId(req);
  if (!requesterId) return false;

  if (isGroupRoom(room)) {
    return new Promise((resolve, reject) => {
      ensureGroupsTable((err) => {
        if (err) return reject(err);
        db.query('SELECT * FROM chat_groups WHERE room = ? LIMIT 1', [room], (err2, results) => {
          if (err2) return reject(err2);
          if (!results || results.length === 0) return resolve(false);
          resolve(groupAccessAllowed(req, results[0]));
        });
      });
    });
  }

  const roomMembers = String(room).replace('chat_', '').split('_').map(String).filter(Boolean);
  return Promise.resolve(roomMembers.includes(requesterId) || (senderId && String(senderId) === requesterId));
};

exports.createGroup = (req, res) => {
  const { room, name, members } = req.body;
  if (!room || !name || !members) {
    return res.status(400).json({ error: 'room, name, and members are required' });
  }
  if (!req.user || !req.user.role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'tl'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only Admin or TL can create groups' });
  }

  const creatorId = getRequesterId(req);
  let membersList = Array.isArray(members) ? members.map(String) : [];
  try {
    if (!Array.isArray(membersList)) {
      membersList = JSON.parse(members);
    }
  } catch (e) {
    membersList = [];
  }
  if (!membersList.map(String).includes(creatorId)) {
    membersList.push(creatorId);
  }
  const membersStr = JSON.stringify(membersList);

  ensureGroupsTable((err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(
      'INSERT INTO chat_groups (room, name, members, created_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, members=?',
      [room, name, membersStr, creatorId, name, membersStr],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, room, name });
      }
    );
  });
};

exports.getGroups = (req, res) => {
  ensureGroupsTable((err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT * FROM chat_groups', (err2, results) => {
      if (err2) return res.status(500).json({ error: err2.message });

      if (req.user?.role === 'admin') {
        return res.json(results);
      }

      const currentUserId = getRequesterId(req);
      const filtered = results.filter(group => {
        try {
          if (String(group.created_by) === currentUserId) return true;
          const membersList = JSON.parse(group.members || '[]');
          return Array.isArray(membersList) && membersList.map(String).includes(currentUserId);
        } catch (e) {
          return false;
        }
      });
      res.json(filtered);
    });
  });
};

module.exports = exports;
