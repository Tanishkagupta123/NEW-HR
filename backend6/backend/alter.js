const mysql = require('mysql2'); 
const con = mysql.createConnection({host:'127.0.0.1', user:'root', password:'', database:'hrms6'}); 
con.connect(); 
con.query('ALTER TABLE payroll ADD COLUMN absent_days INT DEFAULT 0, ADD COLUMN half_days INT DEFAULT 0, ADD COLUMN late_fines INT DEFAULT 0', (err) => { 
  if(err) {
    if(err.code === 'ER_DUP_FIELDNAME') console.log('success');
    else console.error(err);
  } else {
    console.log('success');
  }
  process.exit(); 
});
