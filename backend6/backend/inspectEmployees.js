const mysql = require("mysql2");
const db = mysql.createConnection({host: "127.0.0.1", user: "root", password: "", database: "hrms6"});
db.connect(err => {
  if (err) {
    console.error("CONNERR", err.message);
    process.exit(1);
  }
  db.query("SHOW COLUMNS FROM employees", (e, r) => {
    if (e) {
      console.error("QERR", e.message);
    } else {
      console.log(JSON.stringify(r, null, 2));
    }
    db.end();
  });
});
