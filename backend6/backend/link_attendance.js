const db = require('./configer/db');

async function linkAttendance() {
  const employees = await new Promise((res) => {
    db.query('SELECT id, name, employee_code FROM employees', (err, rows) => res(rows || []));
  });

  console.log(`Linking attendance records to ${employees.length} employees...`);

  for (const emp of employees) {
    const name = emp.name;
    const code = emp.employee_code;
    const numCode = code.replace(/[^0-9]/g, '');

    await new Promise((res) => {
      const sql = `
        UPDATE attendance 
        SET employee_id = ?, employee_name = ?
        WHERE (employee_name = ? OR emp_id = ? OR emp_id = ?)
      `;
      db.query(sql, [emp.id, name, name, code, numCode], (err, r) => {
        if (r && r.affectedRows > 0) {
          console.log(`Linked ${r.affectedRows} attendance records for ${name} (ID: ${emp.id})`);
        }
        res();
      });
    });
  }

  console.log('Attendance linking completed!');
  process.exit(0);
}

linkAttendance();
