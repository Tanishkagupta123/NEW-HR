const express = require('express');
const router = express.Router();
const db = require('../configer/db');
const performanceController = require('../controllers/performanceController');

const createPerformanceReviewsTable = `
  CREATE TABLE IF NOT EXISTS performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    rating DECIMAL(3,2) NOT NULL,
    comments TEXT,
    review_date DATE,
    department VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`;

db.query(createPerformanceReviewsTable, (err) => {
  if (err) {
    console.error('Failed to create performance_reviews table:', err);
  }
});

// GET /admin/performance-management/reviews
router.get('/reviews', performanceController.listReviews);

// POST /admin/performance-management/reviews
router.post('/reviews', performanceController.createReview);

module.exports = router;
