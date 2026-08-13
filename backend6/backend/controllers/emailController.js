const db = require('../configer/db');

function ensureTable(cb) {
  const create = `CREATE TABLE IF NOT EXISTS emails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eventType VARCHAR(255) NOT NULL,
    recipientGroup VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message LONGTEXT NOT NULL,
    attachment VARCHAR(255),
    status ENUM('Draft', 'Scheduled', 'Sent', 'Failed') DEFAULT 'Draft',
    created_by INT,
    sentOn TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  db.query(create, cb);
}

// Get all emails
exports.getAllEmails = (req, res) => {
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT * FROM emails ORDER BY created_at DESC', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
};

// Get single email by ID
exports.getEmailById = (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT * FROM emails WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Email not found' });
      res.json(results[0]);
    });
  });
};

// Create new email
exports.createEmail = (req, res) => {
  const { eventType, recipientGroup, subject, message, attachment } = req.body;
  
  if (!eventType || !recipientGroup || !subject || !message) {
    return res.status(400).json({ error: 'eventType, recipientGroup, subject, and message are required' });
  }
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    const payload = [eventType, recipientGroup, subject, message, attachment || null, 'Sent', req.user?.id || null, new Date()];
    
    db.query(
      'INSERT INTO emails (eventType, recipientGroup, subject, message, attachment, status, created_by, sentOn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      payload,
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        db.query('SELECT * FROM emails WHERE id = ?', [result.insertId], (err2, rows) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.status(201).json(rows[0]);
        });
      }
    );
  });
};

// Update email
exports.updateEmail = (req, res) => {
  const { id } = req.params;
  const { eventType, recipientGroup, subject, message, attachment, status } = req.body;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  if (!eventType || !recipientGroup || !subject || !message) {
    return res.status(400).json({ error: 'eventType, recipientGroup, subject, and message are required' });
  }
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    const payload = [eventType, recipientGroup, subject, message, attachment || null, status || 'Draft', id];
    
    db.query(
      'UPDATE emails SET eventType = ?, recipientGroup = ?, subject = ?, message = ?, attachment = ?, status = ? WHERE id = ?',
      payload,
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Email not found' });
        
        db.query('SELECT * FROM emails WHERE id = ?', [id], (err2, rows) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json(rows[0]);
        });
      }
    );
  });
};

// Delete email
exports.deleteEmail = (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query('DELETE FROM emails WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Email not found' });
      
      res.json({ message: 'Email deleted successfully', id: parseInt(id) });
    });
  });
};

// Send email (mark status as Sent)
exports.sendEmail = (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query('UPDATE emails SET status = ?, sentOn = ? WHERE id = ?', ['Sent', new Date(), id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Email not found' });
      
      db.query('SELECT * FROM emails WHERE id = ?', [id], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.json(rows[0]);
      });
    });
  });
};

// Get emails by event type
exports.getEmailsByEventType = (req, res) => {
  const { eventType } = req.query;
  
  if (!eventType) return res.status(400).json({ error: 'eventType required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query('SELECT * FROM emails WHERE eventType = ? ORDER BY created_at DESC', [eventType], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
};

// Get emails by recipient group
exports.getEmailsByRecipientGroup = (req, res) => {
  const { recipientGroup } = req.query;
  
  if (!recipientGroup) return res.status(400).json({ error: 'recipientGroup required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query('SELECT * FROM emails WHERE recipientGroup = ? ORDER BY created_at DESC', [recipientGroup], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
};
