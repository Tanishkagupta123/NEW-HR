const express = require('express');
const router = express.Router();

// Simple holidays list - could be replaced by DB table later
router.get('/', (req, res) => {
  const year = new Date().getFullYear();
  // Return some sample upcoming holidays (date in 'DD MMM' format)
  const holidays = [
    { name: 'Republic Day', date: `26 Jan` },
    { name: 'Independence Day', date: `15 Aug` },
    { name: 'Diwali', date: `12 Nov` },
    { name: 'Christmas Day', date: `25 Dec` }
  ];
  res.json(holidays);
});

module.exports = router;
