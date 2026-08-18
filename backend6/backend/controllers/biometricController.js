const fs   = require('fs');
const path = require('path');
const db   = require('../configer/db');

const CONFIG_FILE = path.join(__dirname, '..', 'biometric_config.json');

// ── Default / config ────────────────────────────────────
const DEFAULT_CONFIG = {
  enabled: false,
  brand:   'ZKTeco',
  ip:      '',
  port:    4370,
  timeout: 5000,
  syncIntervalMinutes: 5,
  onTimeLimit: '09:35',
  lateLimit: '11:00',
  lateFineAmount: 50,
  earlyOutLimit: '13:00',
  fullDayOutLimit: '17:00'
};

// ── Read / Write config ───────────────────────────────────────
const readConfig = () => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
  } catch { return { ...DEFAULT_CONFIG }; }
};

const writeConfig = (data) => {
  const cfg = { ...readConfig(), ...data };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  return cfg;
};

// ── ZKTeco connect helper ─────────────────────────────────────
const connectZK = async (ip, port, timeout) => {
  const ZKLib = require('node-zklib');
  const zk = new ZKLib(ip, port || 4370, timeout || 5000, 4000);
  await zk.createSocket();
  return zk;
};

// ── Save one attendance record from machine to DB ─────────────
const saveAttendanceRecord = (record, machineUsersMap = {}) => {
  return new Promise((resolve, reject) => {
    const userId = record.deviceUserId || record.userId || record.userSn || (record.data && (record.data.deviceUserId || record.data.userId));
    const recordTime = record.recordTime || record.time || (record.data && (record.data.recordTime || record.data.time));
    if (!userId || !recordTime) return resolve(null);

    const date     = new Date(recordTime);
    const dateStr  = date.toISOString().slice(0, 10);
    const timeStr  = date.toTimeString().slice(0, 8);
    const year     = date.getFullYear();
    const month    = date.getMonth() + 1;
    const dayName  = date.toLocaleDateString('en-GB', { weekday: 'long' });

    // Machine registered name for this userId
    const rawId = String(userId).trim();
    const numId = parseInt(rawId, 10) || 0;
    const machineName = (machineUsersMap[rawId] || machineUsersMap[numId] || '').trim();

    // Find employee in DB by id, employee_code, or matching machineName
    const empSql = `
      SELECT id, name, monthly_salary 
      FROM employees 
      WHERE id = ? 
         OR employee_code = ? 
         OR employee_code = ? 
         OR employee_code = ?
         OR REPLACE(REPLACE(LOWER(employee_code), 'emp-', ''), 'emp', '') = ?
         ${machineName ? 'OR LOWER(name) = ? OR LOWER(name) LIKE ?' : ''}
      LIMIT 1`;

    const empParams = [numId, rawId, `EMP-${rawId}`, `EMP-${String(numId).padStart(2, '0')}`, rawId];
    if (machineName) {
      empParams.push(machineName.toLowerCase(), `%${machineName.toLowerCase()}%`);
    }

    db.query(empSql, empParams, (empErr, empRows) => {
      const emp          = empRows && empRows.length > 0 ? empRows[0] : null;
      const employeeId   = emp ? emp.id : (numId || rawId);
      const employeeName = emp ? emp.name : (machineName || `Employee ${rawId}`);
      const monthlySal   = emp ? parseFloat(emp.monthly_salary || 0) : 0;
      const dailySal     = monthlySal > 0 ? parseFloat((monthlySal / 30).toFixed(2)) : 0;

      // Check if record for this date and employee exists
      const selSql = 'SELECT * FROM attendance WHERE (employee_id = ? OR emp_id = ?) AND `date` = ? LIMIT 1';
      db.query(selSql, [employeeId, String(userId), dateStr], (selErr, rows) => {
        if (selErr) {
          console.error('Error selecting attendance:', selErr);
          return resolve(null);
        }
        const existing = rows && rows[0];

        if (!existing) {
          // First punch of the day → Check-In
          const ins = {
            employee_id: employeeId,
            emp_id: String(userId),
            student_id: String(userId),
            employee_name: employeeName,
            date: dateStr, year, month, day: dayName,
            check_in: timeStr, mode: 'Biometric', status: 'IN',
            attendance_status: 'IN', late_fine: 0, final_salary: dailySal,
            updated_at: new Date()
          };
          const cols = Object.keys(ins);
          const vals = cols.map(k => ins[k]);
          db.query(
            `INSERT INTO attendance (${cols.map(c => '`' + c + '`').join(',')}) VALUES (${cols.map(()=>'?').join(',')})`,
            vals, (insErr) => {
              if (insErr) console.error('Error inserting attendance:', insErr);
              resolve(insErr ? null : { action: 'CHECK_IN', employeeId, dateStr, timeStr });
            }
          );
        } else if (existing.check_in && !existing.check_out && timeStr > existing.check_in) {
          // Second punch → Check-Out — compute status
          const { status, lateFine } = computeStatus(existing.check_in, timeStr, dailySal);
          const finalSalary = Math.max(0, dailySal - lateFine);
          db.query(
            `UPDATE attendance SET employee_name=?, check_out=?, status=?, attendance_status=?, late_fine=?, final_salary=?, mode='Biometric', updated_at=NOW()
             WHERE id=?`,
            [employeeName, timeStr, status, status, lateFine, finalSalary, existing.id],
            (updErr) => {
              if (updErr) console.error('Error updating checkout:', updErr);
              resolve(updErr ? null : { action: 'CHECK_OUT', employeeId, dateStr, timeStr, status });
            }
          );
        } else {
          // Update name if it was previously generic
          if (existing && (!existing.employee_name || existing.employee_name.startsWith('Employee ')) && employeeName) {
            db.query('UPDATE attendance SET employee_name = ? WHERE id = ?', [employeeName, existing.id], () => resolve(null));
          } else {
            resolve(null);
          }
        }
      });
    });
  });
};

// ── Reuse same attendance rule logic ─────────────────────────
const toMin = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const computeStatus = (checkIn, checkOut, dailySal) => {
  const cfg = readConfig();
  const ON_TIME   = toMin(cfg.onTimeLimit || '09:35');
  const VERY_LATE = toMin(cfg.lateLimit || '11:00');
  const EARLY_OUT = toMin(cfg.earlyOutLimit || '13:00');
  const FULL_OUT  = toMin(cfg.fullDayOutLimit || '17:00');
  const LATE_FINE = Number(cfg.lateFineAmount ?? 50);

  const inMin  = toMin(checkIn);
  const outMin = checkOut ? toMin(checkOut) : null;
  const isLate     = inMin > ON_TIME && inMin <= VERY_LATE;
  const isVeryLate = inMin > VERY_LATE;

  if (outMin === null) {
    if (isVeryLate) return { status: 'HALF_DAY', lateFine: +(dailySal / 2).toFixed(2) };
    if (isLate)     return { status: 'LATE',     lateFine: LATE_FINE };
    return { status: 'IN', lateFine: 0 };
  }
  if (isVeryLate) return { status: 'HALF_DAY', lateFine: +(dailySal / 2).toFixed(2) };
  if (outMin < EARLY_OUT) {
    if (isLate) return { status: 'HALF_DAY', lateFine: +(dailySal / 2).toFixed(2) };
    return { status: 'FULL_CUT', lateFine: +dailySal.toFixed(2) };
  }
  if (outMin >= FULL_OUT) {
    if (isLate) return { status: 'LATE',      lateFine: LATE_FINE };
    return { status: 'COMPLETED', lateFine: 0 };
  }
  return { status: 'HALF_DAY', lateFine: +(dailySal / 2).toFixed(2) };
};

// ── API: Get current machine config ──────────────────────────
const getConfig = (req, res) => {
  res.json({ success: true, config: readConfig() });
};

// ── API: Save machine config ──────────────────────────────────
const saveConfig = (req, res) => {
  try {
    const {
      enabled, brand, ip, port, timeout, syncIntervalMinutes,
      onTimeLimit, lateLimit, lateFineAmount, earlyOutLimit, fullDayOutLimit
    } = req.body;
    const updated = writeConfig({
      enabled:             typeof enabled === 'boolean' ? enabled : undefined,
      brand:               brand               || undefined,
      ip:                  ip                  !== undefined ? ip.trim() : undefined,
      port:                port                ? Number(port) : undefined,
      timeout:             timeout             ? Number(timeout) : undefined,
      syncIntervalMinutes: syncIntervalMinutes ? Number(syncIntervalMinutes) : undefined,
      onTimeLimit:         onTimeLimit         || undefined,
      lateLimit:           lateLimit           || undefined,
      lateFineAmount:      lateFineAmount      !== undefined ? Number(lateFineAmount) : undefined,
      earlyOutLimit:       earlyOutLimit       || undefined,
      fullDayOutLimit:     fullDayOutLimit     || undefined
    });
    // Restart sync with new config
    startAutoSync();
    res.json({ success: true, message: 'Configuration saved successfully', config: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── API: Test connection ──────────────────────────────────────
const testConnection = async (req, res) => {
  const cfg = readConfig();
  const targetIp = (req.body && req.body.ip) || cfg.ip;
  const targetPort = (req.body && req.body.port) || cfg.port || 4370;
  const targetTimeout = (req.body && req.body.timeout) || cfg.timeout || 5000;

  if (!targetIp) return res.status(400).json({ success: false, message: 'Machine IP not provided' });

  let zk = null;
  try {
    zk = await connectZK(targetIp, targetPort, targetTimeout);
    const info = await zk.getInfo();
    return res.json({ success: true, message: 'Connected successfully', deviceInfo: info });
  } catch (err) {
    const errMsg = err?.err?.message || err?.message || (typeof err === 'string' ? err : 'Connection timed out or unreachable');
    return res.status(500).json({ success: false, message: `Connection failed: ${errMsg}` });
  } finally {
    if (zk) { try { await zk.disconnect(); } catch(e){} }
  }
};

// ── API: Manual sync (pull latest from machine) ───────────────
const syncNow = async (req, res) => {
  const cfg = readConfig();
  const targetIp = (req.body && req.body.ip) || cfg.ip;
  const targetPort = (req.body && req.body.port) || cfg.port || 4370;
  const targetTimeout = (req.body && req.body.timeout) || cfg.timeout || 5000;

  if (!targetIp) {
    return res.status(400).json({ success: false, message: 'Machine not configured or IP missing' });
  }

  let zk = null;
  try {
    zk = await connectZK(targetIp, targetPort, targetTimeout);

    // 1. Fetch user names from machine
    const machineUsersMap = {};
    try {
      const usersData = await zk.getUsers();
      const userList = (usersData && usersData.data ? usersData.data : usersData) || [];
      userList.forEach(u => {
        if (u && u.name) {
          const uid = String(u.userId || u.uid || '');
          if (uid) machineUsersMap[uid] = u.name.trim();
        }
      });
    } catch (uErr) {
      console.warn('Could not fetch machine users list:', uErr.message);
    }

    // 2. Fetch logs
    const logs = await zk.getAttendances();
    const records = (logs && logs.data ? logs.data : logs) || [];
    
    // Sort chronologically
    records.sort((a, b) => new Date(a.recordTime) - new Date(b.recordTime));

    const results = [];
    for (const rec of records) {
      const r = await saveAttendanceRecord(rec, machineUsersMap);
      if (r) results.push(r);
    }

    return res.json({
      success: true,
      message: `Sync complete. ${results.length} new/updated attendance records processed.`,
      total: records.length,
      saved: results.length
    });
  } catch (err) {
    const errMsg = err?.err?.message || err?.message || (typeof err === 'string' ? err : 'Sync failed');
    return res.status(500).json({ success: false, message: `Sync failed: ${errMsg}` });
  } finally {
    if (zk) { try { await zk.disconnect(); } catch(e){} }
  }
};

// ── Auto-sync runner (called from server.js) ──────────────────
let syncTimer = null;

const startAutoSync = () => {
  if (syncTimer) clearInterval(syncTimer);

  const cfg = readConfig();
  if (!cfg.enabled || !cfg.ip) return;

  const intervalMs = (cfg.syncIntervalMinutes || 5) * 60 * 1000;

  syncTimer = setInterval(async () => {
    try {
      const zk = await connectZK(cfg.ip, cfg.port || 4370, cfg.timeout || 5000);
      const machineUsersMap = {};
      try {
        const usersData = await zk.getUsers();
        const userList = (usersData && usersData.data ? usersData.data : usersData) || [];
        userList.forEach(u => {
          if (u && u.name) {
            const uid = String(u.userId || u.uid || '');
            if (uid) machineUsersMap[uid] = u.name.trim();
          }
        });
      } catch (e) {}

      const logs = await zk.getAttendances();
      const records = (logs && logs.data ? logs.data : logs) || [];
      records.sort((a, b) => new Date(a.recordTime) - new Date(b.recordTime));
      for (const rec of records) {
        await saveAttendanceRecord(rec, machineUsersMap);
      }
      await zk.disconnect();
      console.log(`[Auto-Sync] Biometric logs synced: ${records.length} records processed at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.warn('[Auto-Sync] Biometric auto-sync cycle error:', err?.message || err);
    }
  }, intervalMs);

  console.log(`[Auto-Sync] Biometric auto-sync started every ${cfg.syncIntervalMinutes || 5} min`);
};

module.exports = {
  readConfig,
  writeConfig,
  getConfig,
  saveConfig,
  testConnection,
  syncNow,
  startAutoSync
};
