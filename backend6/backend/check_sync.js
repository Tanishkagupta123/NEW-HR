const ZKLib = require('node-zklib');
const db = require('./configer/db');

async function syncAndCheck() {
  const zk = new ZKLib('192.168.1.201', 4370, 5000, 4000);
  try {
    console.log('Connecting to machine at 192.168.1.201...');
    await zk.createSocket();
    const logs = await zk.getAttendances();
    const records = (logs && logs.data ? logs.data : logs) || [];
    console.log(`Total logs in machine: ${records.length}`);
    
    // Show last 5 records
    const recent = records.slice(-5);
    console.log('Recent 5 logs from machine:', JSON.stringify(recent, null, 2));

    await zk.disconnect();

    // Check DB attendance
    db.query('SELECT * FROM attendance ORDER BY id DESC LIMIT 5', (err, rows) => {
      console.log('DB Recent attendance records:', rows);
      process.exit();
    });
  } catch (err) {
    console.error('Error in syncAndCheck:', err);
    try { await zk.disconnect(); } catch(e) {}
    process.exit(1);
  }
}

syncAndCheck();
