const db = require('../configer/db');

const LEAVES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  employee_name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  reason TEXT,
  date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
`;

function ensureLeavesTable(cb) {
  db.query(LEAVES_TABLE_SQL, (err) => cb && cb(err));
}

// Create a leave request
exports.create = (req, res) => {
  const { employeeId, employeeName, type, reason, date, status } = req.body;
  if (!employeeId || !employeeName || !type || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const runInsert = () => {
    const sql = `INSERT INTO leaves (employee_id, employee_name, type, reason, date, status) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [employeeId, employeeName, type, reason || '', date, status || 'Pending'], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.status(201).json({ success: true, id: result.insertId, message: 'Leave created' });
    });
  };

  ensureLeavesTable((err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    runInsert();
  });
};

// List all leaves (admin)
exports.list = (req, res) => {
  const runList = () => {
    const sql = `SELECT * FROM leaves ORDER BY created_at DESC`;
    db.query(sql, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      // Map DB fields to frontend-friendly keys
      const mapped = result.map(r => ({
        _id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        type: r.type,
        reason: r.reason,
        date: r.date ? new Date(r.date).toISOString().split('T')[0] : null,
        status: r.status,
        created_at: r.created_at
      }));
      res.json(mapped);
    });
  };

  ensureLeavesTable((err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    runList();
  });
};

// Get leaves for a specific employee
exports.byEmployee = (req, res) => {
  const { id } = req.params;
  const runQuery = () => {
    const sql = `SELECT * FROM leaves WHERE employee_id = ? ORDER BY date DESC`;
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      const mapped = result.map(r => ({
        _id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        type: r.type,
        reason: r.reason,
        date: r.date ? new Date(r.date).toISOString().split('T')[0] : null,
        status: r.status,
        created_at: r.created_at
      }));
      res.json(mapped);
    });
  };

  ensureLeavesTable((err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    runQuery();
  });
};

// Optional: update leave status
exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Missing status' });

  const runUpdate = () => {
    const sql = `UPDATE leaves SET status = ? WHERE id = ?`;
    db.query(sql, [status, id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Status updated' });
    });
  };

  ensureLeavesTable((err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    runUpdate();
  });
};
