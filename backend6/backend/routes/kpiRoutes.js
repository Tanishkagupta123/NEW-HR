const express = require('express');
const router = express.Router();
const db = require('../configer/db');

// GET /kpi/all - list all KPIs
router.get('/all', (req, res) => {
  const sql = 'SELECT * FROM kpis ORDER BY id DESC';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(result);
  });
});

// POST /kpi/add - add a KPI record
router.post('/add', (req, res) => {
  const { employee, department, target, achieved, progress, status } = req.body;
  const sql = 'INSERT INTO kpis (employee, department, target, achieved, progress, status) VALUES (?,?,?,?,?,?)';
  db.query(sql, [employee, department, target, achieved, progress, status], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json({ id: result.insertId });
  });
});

// PUT /kpi/update/:id - update a KPI record
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { employee, department, target, achieved, progress, status } = req.body;
  const sql = 'UPDATE kpis SET employee = ?, department = ?, target = ?, achieved = ?, progress = ?, status = ? WHERE id = ?';
  db.query(sql, [employee, department, target, achieved, progress, status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ status: 'Updated' });
  });
});

module.exports = router;
