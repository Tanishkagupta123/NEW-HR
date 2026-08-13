const db = require('../configer/db');

function ensureTable(cb) {
  const create = `CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    priority ENUM('Low', 'Normal', 'Medium', 'High') DEFAULT 'Normal',
    expiry DATE,
    department VARCHAR(255) DEFAULT 'All',
    attachment VARCHAR(255),
    pinned BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  db.query(create, cb);
}

// Get all notices
exports.getAllNotices = (req, res) => {
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT * FROM notices ORDER BY pinned DESC, created_at DESC', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
};

// Get single notice by ID
exports.getNoticeById = (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('SELECT * FROM notices WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Notice not found' });
      res.json(results[0]);
    });
  });
};

// Create new notice
exports.createNotice = (req, res) => {
  const { title, content, priority, expiry, department, attachment } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    const payload = [title, content, priority || 'Normal', expiry || null, department || 'All', attachment || null, req.user?.id || null];
    
    db.query(
      'INSERT INTO notices (title, content, priority, expiry, department, attachment, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      payload,
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        db.query('SELECT * FROM notices WHERE id = ?', [result.insertId], (err2, rows) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.status(201).json(rows[0]);
        });
      }
    );
  });
};

// Update notice
exports.updateNotice = (req, res) => {
  const { id } = req.params;
  const { title, content, priority, expiry, department, attachment } = req.body;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    const payload = [title, content, priority || 'Normal', expiry || null, department || 'All', attachment || null, id];
    
    db.query(
      'UPDATE notices SET title = ?, content = ?, priority = ?, expiry = ?, department = ?, attachment = ? WHERE id = ?',
      payload,
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Notice not found' });
        
        db.query('SELECT * FROM notices WHERE id = ?', [id], (err2, rows) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json(rows[0]);
        });
      }
    );
  });
};

// Delete notice
exports.deleteNotice = (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query('DELETE FROM notices WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Notice not found' });
      
      res.json({ message: 'Notice deleted successfully', id: parseInt(id) });
    });
  });
};

// Toggle pin status
exports.togglePin = (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ error: 'ID required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query('SELECT pinned FROM notices WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Notice not found' });
      
      const newPinnedStatus = !results[0].pinned;
      db.query('UPDATE notices SET pinned = ? WHERE id = ?', [newPinnedStatus, id], (err2, result) => {
        if (err2) return res.status(500).json({ error: err2 });
        
        db.query('SELECT * FROM notices WHERE id = ?', [id], (err3, rows) => {
          if (err3) return res.status(500).json({ error: err3 });
          res.json(rows[0]);
        });
      });
    });
  });
};

// Get notices by department
exports.getNoticesByDepartment = (req, res) => {
  const { department } = req.query;
  
  if (!department) return res.status(400).json({ error: 'Department required' });
  
  ensureTable((err) => {
    if (err) return res.status(500).json({ error: err });
    
    db.query(
      'SELECT * FROM notices WHERE department = ? OR department = "All" ORDER BY pinned DESC, created_at DESC',
      [department],
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
      }
    );
  });
};
