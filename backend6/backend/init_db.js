const fs = require('fs');
const mysql = require('mysql2');

const sqlFile = __dirname + '/db_schema.sql';
if (!fs.existsSync(sqlFile)) {
  console.error('db_schema.sql not found in backend folder.');
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true
});

conn.connect((err) => {
  if (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }

  conn.query(sql, (err) => {
    if (err) {
      console.error('Error running SQL:', err.message);
      process.exit(1);
    }

    console.log('Database initialized successfully.');
    conn.end();
  });
});
