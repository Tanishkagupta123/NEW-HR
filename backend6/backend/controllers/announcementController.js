const db = require('../configer/db');

function ensureTable(cb) {
  const create = `CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    priority ENUM('Low', 'Normal', 'Medium', 'High') DEFAULT 'Normal',
    scheduleDate DATE,
    department VARCHAR(255) DEFAULT 'All',
    attachment VARCHAR(255),
    history JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  db.query(create, cb);
}

// Get all announcements
exports.getAllAnnouncements = (req, res) => {
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT * FROM announcements ORDER BY created_at DESC', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      // Parse history JSON field
      const parsed = results.map(a => ({
        ...a,
        history: a.history ? JSON.parse(a.history) : []
      }));
      res.json(parsed);
    });
  });
};

// Get single announcement by ID
exports.getAnnouncementById = (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT * FROM announcements WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Announcement not found' });
      
      const announcement = results[0];
      announcement.history = announcement.history ? JSON.parse(announcement.history) : [];
      res.json(announcement);
    });
  });
};

// Create new announcement
exports.createAnnouncement = (req, res) => {
  const { title, content, priority, scheduleDate, department, attachment } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    const history = JSON.stringify([`Created on ${new Date().toLocaleDateString()}`]);
    const payload = [title, content, priority || 'Normal', scheduleDate || null, department || 'All', attachment || null, history, req.user?.id || null];
    
    db.query(
      'INSERT INTO announcements (title, content, priority, scheduleDate, department, attachment, history, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      payload,
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        db.query('SELECT * FROM announcements WHERE id = ?', [result.insertId], (err2, rows) => {
          if (err2) return res.status(500).json({ error: err2 });
          const announcement = rows[0];
          announcement.history = announcement.history ? JSON.parse(announcement.history) : [];
          res.status(201).json(announcement);
        });
      }
    );
  });
};

// Update announcement
exports.updateAnnouncement = (req, res) => {
  const { id } = req.params;
  const { title, content, priority, scheduleDate, department, attachment, history } = req.body;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    // Get existing history and add new update entry
    db.query('SELECT history FROM announcements WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Announcement not found' });
      
      let updatedHistory = history || (results[0].history ? JSON.parse(results[0].history) : []);
      if (!Array.isArray(updatedHistory)) {
        updatedHistory = [];
      }
      updatedHistory.push(`Updated on ${new Date().toLocaleDateString()}`);
      const historyJSON = JSON.stringify(updatedHistory);
      
      const payload = [title, content, priority || 'Normal', scheduleDate || null, department || 'All', attachment || null, historyJSON, id];
      
      db.query(
        'UPDATE announcements SET title = ?, content = ?, priority = ?, scheduleDate = ?, department = ?, attachment = ?, history = ? WHERE id = ?',
        payload,
        (err2, result) => {
          if (err2) return res.status(500).json({ error: err2 });
          
          db.query('SELECT * FROM announcements WHERE id = ?', [id], (err3, rows) => {
            if (err3) return res.status(500).json({ error: err3 });
            const announcement = rows[0];
            announcement.history = announcement.history ? JSON.parse(announcement.history) : [];
            res.json(announcement);
          });
        }
      );
    });
  });
};

// Delete announcement
exports.deleteAnnouncement = (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query('DELETE FROM announcements WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Announcement not found' });
      
      res.json({ message: 'Announcement deleted successfully', id: parseInt(id) });
    });
  });
};

// Get announcements by department
exports.getAnnouncementsByDepartment = (req, res) => {
  const { department } = req.query;
  
  if (!department) return res.status(400).json({ error: 'Department required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query(
      'SELECT * FROM announcements WHERE department = ? OR department = "All" ORDER BY created_at DESC',
      [department],
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        const parsed = results.map(a => ({
          ...a,
          history: a.history ? JSON.parse(a.history) : []
        }));
        res.json(parsed);
      }
    );
  });
};
