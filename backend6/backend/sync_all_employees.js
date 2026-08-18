const db = require('./configer/db');
let ZKLib;
try {
  ZKLib = require('node-zklib');
} catch (e) {}

async function syncAllEmployees() {
  console.log('Fetching machine users...');
  let machineUsers = [];
  if (ZKLib) {
    try {
      const zk = new ZKLib('192.168.1.201', 4370, 5000, 4000);
      await zk.createSocket();
      const u = await zk.getUsers();
      machineUsers = u?.data || [];
      await zk.disconnect();
      console.log(`Found ${machineUsers.length} users in biometric machine.`);
    } catch (err) {
      console.log('Biometric direct fetch note:', err.message);
    }
  }

  // Also fetch unique names from attendance records
  const attUsers = await new Promise((resolve) => {
    db.query('SELECT DISTINCT employee_name, emp_id, employee_id FROM attendance WHERE employee_name IS NOT NULL AND employee_name != ""', (err, rows) => {
      resolve(rows || []);
    });
  });
  console.log(`Found ${attUsers.length} unique employees in attendance table.`);

  // Combine machine users and attendance users
  const candidates = new Map();

  machineUsers.forEach(u => {
    const name = (u.name || '').trim();
    const uid = u.userId || u.uid || u.user_id;
    if (name) {
      candidates.set(name.toLowerCase(), {
        name: name,
        code: `EMP-${uid}`,
        deviceUserId: uid
      });
    }
  });

  attUsers.forEach(a => {
    const name = (a.employee_name || '').trim();
    const code = a.emp_id || (a.employee_id ? `EMP-${a.employee_id}` : '');
    if (name && !candidates.has(name.toLowerCase())) {
      candidates.set(name.toLowerCase(), {
        name: name,
        code: code || `EMP-${Date.now().toString().slice(-4)}`,
        deviceUserId: a.employee_id || a.emp_id
      });
    }
  });

  console.log(`Total unique candidate employees to check/insert: ${candidates.size}`);

  // Fetch existing employees
  const existingEmployees = await new Promise((resolve) => {
    db.query('SELECT id, name, employee_code, email FROM employees', (err, rows) => resolve(rows || []));
  });

  const existingMap = new Map();
  existingEmployees.forEach(e => {
    if (e.name) existingMap.set(e.name.trim().toLowerCase(), e);
    if (e.employee_code) existingMap.set(e.employee_code.trim().toLowerCase(), e);
  });

  let insertedCount = 0;
  for (const [key, cand] of candidates.entries()) {
    const nameLower = cand.name.toLowerCase();
    const codeLower = cand.code.toLowerCase();

    if (!existingMap.has(nameLower) && !existingMap.has(codeLower)) {
      const email = `${cand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@company.com`;
      const sql = `
        INSERT INTO employees (name, employee_code, email, designation, department, role, monthly_salary, joining_date)
        VALUES (?, ?, ?, 'Staff Member', 'Operations', 'employee', 15000, CURDATE())
      `;
      await new Promise((res) => {
        db.query(sql, [cand.name, cand.code, email], (err, result) => {
          if (err) {
            console.error(`Failed to insert ${cand.name}:`, err.message);
          } else {
            console.log(`✅ Added employee to DB: ${cand.name} (${cand.code}) - ID: ${result.insertId}`);
            insertedCount++;
          }
          res();
        });
      });
    } else {
      console.log(`ℹ️ Already exists: ${cand.name}`);
    }
  }

  console.log(`\n🎉 Completed! Added ${insertedCount} new employees to employees table.`);

  // Final check of employees table
  const allFinal = await new Promise((resolve) => {
    db.query('SELECT id, name, employee_code, email, department FROM employees ORDER BY id ASC', (err, rows) => resolve(rows || []));
  });
  console.log(`Total employees in DB now: ${allFinal.length}`);
  console.table(allFinal);

  process.exit(0);
}

syncAllEmployees();
