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

const formatDateLocal = (dbDate) => {
  if (!dbDate) return null;
  const d = new Date(dbDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
        date: formatDateLocal(r.date),
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
        date: formatDateLocal(r.date),
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
      
      // If approved, cut salary (insert/update attendance as FULL_CUT)
      if (status === 'Approved') {
        db.query('SELECT employee_id, date FROM leaves WHERE id = ?', [id], (err, rows) => {
          if (!err && rows.length > 0) {
            const leave = rows[0];
            const empId = leave.employee_id;
            // Get local YYYY-MM-DD
            const d = new Date(leave.date);
            const leaveDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            
            // Get employee salary
            db.query('SELECT name, monthly_salary FROM employees WHERE id = ?', [empId], (err, empRows) => {
              if (!err && empRows.length > 0) {
                const emp = empRows[0];
                const dailySalary = emp.monthly_salary ? parseFloat((emp.monthly_salary / 30).toFixed(2)) : 0;
                
                // Update or Insert attendance
                const payload = {
                  employee_name: emp.name,
                  year: d.getFullYear(),
                  month: d.getMonth() + 1,
                  day: d.toLocaleDateString('en-GB', { weekday: 'long' }),
                  status: 'FULL_CUT',
                  attendance_status: 'FULL_CUT',
                  late_fine: dailySalary,
                  final_salary: 0,
                  mode: 'Admin',
                  updated_at: new Date()
                };
                
                db.query('SELECT id FROM attendance WHERE employee_id = ? AND date = ?', [empId, leaveDate], (err, attRows) => {
                  if (attRows && attRows.length > 0) {
                    // update
                    const fields = Object.keys(payload).map(k => `${k} = ?`).join(', ');
                    const vals = [...Object.values(payload), empId, leaveDate];
                    db.query(`UPDATE attendance SET ${fields} WHERE employee_id = ? AND date = ?`, vals);
                  } else {
                    // insert
                    payload.employee_id = empId;
                    payload.date = leaveDate;
                    const cols = Object.keys(payload);
                    const vals = cols.map(k => payload[k]);
                    const qs = cols.map(() => '?').join(', ');
                    db.query(`INSERT INTO attendance (${cols.join(', ')}) VALUES (${qs})`, vals);
                  }
                });
              }
            });
          }
        });
      }

      res.json({ success: true, message: 'Status updated' });
    });
  };

  ensureLeavesTable((err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    runUpdate();
  });
};
