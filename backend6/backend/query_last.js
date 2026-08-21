require('dotenv').config(); const db = require('./configer/db'); db.query('SELECT * FROM certificates ORDER BY id DESC LIMIT 1', (err, rows) => { console.log(rows); process.exit(); });
