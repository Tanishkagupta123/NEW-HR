const mysql = require('mysql2'); 
const con = mysql.createConnection({host:'127.0.0.1', user:'root', password:'', database:'hrms6'}); 
con.connect(); 
con.query("UPDATE payroll SET month_year = 'August 2026' WHERE month_year LIKE '2026-08-%' OR month_year = '2026-08-21'", (err) => { 
  console.log(err || 'success');
  process.exit(); 
});
