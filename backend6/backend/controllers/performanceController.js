const db = require('../configer/db');

// List reviews. Optional query param: employee_id
exports.listReviews = (req, res) => {
  const { employee_id } = req.query;
  let sql = `SELECT pr.id, pr.employee_id, pr.reviewer_id, pr.rating, pr.comments, pr.review_date, pr.department, e.name as employee_name, r.name as reviewer_name
             FROM performance_reviews pr
             LEFT JOIN employees e ON pr.employee_id = e.id
             LEFT JOIN employees r ON pr.reviewer_id = r.id`;

  const params = [];
  if (employee_id) {
    sql += ' WHERE pr.employee_id = ?';
    params.push(employee_id);
  }

  sql += ' ORDER BY pr.review_date DESC, pr.id DESC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
};

// Create a new review
exports.createReview = (req, res) => {
  const { employee_id, reviewer_id, rating, comments, review_date } = req.body;

  if (!employee_id || !reviewer_id || typeof rating === 'undefined') {
    return res.status(400).json({ success: false, message: 'employee_id, reviewer_id and rating are required' });
  }

  const sql = `
    INSERT INTO performance_reviews (
      employee_id, reviewer_id, rating, comments, review_date, department, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [employee_id, reviewer_id, rating, comments || null, review_date || null, req.body.department || null], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    res.status(201).json({ success: true, message: 'Review created', id: result.insertId });
  });
};
