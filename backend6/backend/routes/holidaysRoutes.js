const express = require('express');
const router = express.Router();
const db = require('../configer/db');

const HOLIDAYS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(HOLIDAYS_TABLE_SQL, () => {});

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM holidays ORDER BY holiday_date ASC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    const mapped = results.map(h => {
      const d = new Date(h.holiday_date);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      return {
        id: h.id,
        name: h.name,
        date: `${day} ${month}`,
        full_date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${day}`
      };
    });
    res.json(mapped);
  });
});

router.post('/', (req, res) => {
  const { name, date } = req.body;
  if (!name || !date) return res.status(400).json({ success: false, message: 'Missing name or date' });
  
  const sql = 'INSERT INTO holidays (name, holiday_date) VALUES (?, ?)';
  db.query(sql, [name, date], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Holiday added successfully', id: result.insertId });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM holidays WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Holiday deleted' });
  });
});

module.exports = router;
