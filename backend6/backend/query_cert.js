const db = require('./configer/db'); db.query('SELECT id, file_path FROM certificates', (err, rows) => { console.log(rows); process.exit(); });
