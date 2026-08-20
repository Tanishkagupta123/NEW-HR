const db = require('../configer/db');
const fs = require('fs');
const path = require('path');

const LOCATION_FILE = path.join(__dirname, '..', 'attendance_location.json');
const DEFAULT_OFFICE_LOCATION = { lat: 22.7426385, lon: 77.6838617, radius: 4000 };

const readLocationConfig = () => {
  try {
    if (!fs.existsSync(LOCATION_FILE)) {
      return DEFAULT_OFFICE_LOCATION;
    }
    const raw = fs.readFileSync(LOCATION_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      lat: typeof parsed.lat === 'number' ? parsed.lat : DEFAULT_OFFICE_LOCATION.lat,
      lon: typeof parsed.lon === 'number' ? parsed.lon : DEFAULT_OFFICE_LOCATION.lon,
      radius: typeof parsed.radius === 'number' ? parsed.radius : DEFAULT_OFFICE_LOCATION.radius,
    };
  } catch (err) {
    return DEFAULT_OFFICE_LOCATION;
  }
};

const writeLocationConfig = (location) => {
  const data = {
    lat: Number(location.lat) || DEFAULT_OFFICE_LOCATION.lat,
    lon: Number(location.lon) || DEFAULT_OFFICE_LOCATION.lon,
    radius: Number(location.radius) || DEFAULT_OFFICE_LOCATION.radius,
  };
  fs.writeFileSync(LOCATION_FILE, JSON.stringify(data, null, 2), 'utf8');
  return data;
};

const parseIntOrNull = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const toMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const normalizeTime = (date) => date.toTimeString().slice(0, 8);

const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const { readConfig } = require('./biometricController');

const computeAttendanceStatus = (checkIn, checkOut, dailySalary = 0) => {
  const cfg = (typeof readConfig === 'function') ? readConfig() : {};
  const ON_TIME_LIMIT   = toMinutes(cfg.onTimeLimit || '09:35');
  const VERY_LATE_LIMIT = toMinutes(cfg.lateLimit || '11:00');
  const EARLY_OUT_LIMIT = toMinutes(cfg.earlyOutLimit || '13:00');
  const FULL_DAY_OUT    = toMinutes(cfg.fullDayOutLimit || '17:00');
  const LATE_FINE       = Number(cfg.lateFineAmount ?? 50);

  const result = { status: 'PENDING', lateFine: 0 };

  if (!checkIn) {
    if (checkOut) { result.status = 'OUT'; }
    return result;
  }

  const inMin  = toMinutes(checkIn);
  const outMin = checkOut ? toMinutes(checkOut) : null;

  const isOnTime   = inMin <= ON_TIME_LIMIT;
  const isLate     = inMin > ON_TIME_LIMIT && inMin <= VERY_LATE_LIMIT;
  const isVeryLate = inMin > VERY_LATE_LIMIT;

  // ── No checkout yet ──────────────────────────────────────────
  if (outMin === null) {
    if (isVeryLate) {
      result.status  = 'HALF_DAY';
      result.lateFine = +(dailySalary / 2).toFixed(2);
    } else if (isLate) {
      result.status  = 'LATE';
      result.lateFine = LATE_FINE;
    } else {
      result.status = 'IN';
    }
    return result;
  }

  // ── With checkout ────────────────────────────────────────────
  if (isVeryLate) {
    result.status   = 'HALF_DAY';
    result.lateFine = +(dailySalary / 2).toFixed(2);
    return result;
  }

  if (outMin < EARLY_OUT_LIMIT) {
    if (isLate) {
      result.status   = 'HALF_DAY';
      result.lateFine = +(dailySalary / 2).toFixed(2);
    } else {
      result.status   = 'FULL_CUT';
      result.lateFine = +dailySalary.toFixed(2);
    }
    return result;
  }

  if (outMin >= FULL_DAY_OUT) {
    if (isLate) {
      result.status   = 'LATE';
      result.lateFine = LATE_FINE;
    } else {
      result.status   = 'COMPLETED';
      result.lateFine = 0;
    }
    return result;
  }

  result.status   = 'HALF_DAY';
  result.lateFine = +(dailySalary / 2).toFixed(2);
  return result;
};

const getMonthlyAttendance = (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
  const sql = 'SELECT * FROM attendance WHERE YEAR(`date`) = ? AND MONTH(`date`) = ? ORDER BY `date` DESC';

  db.query(sql, [year, month], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json(results || []);
  });
};

const getEmployeeAttendance = (req, res) => {
  const employeeId = parseIntOrNull(req.params.id);
  const queryDate = req.query.date;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'Employee ID required' });
  }

  let sql;
  let params;
  if (queryDate) {
    sql = 'SELECT * FROM attendance WHERE employee_id = ? AND `date` = ? ORDER BY id DESC LIMIT 1';
    params = [employeeId, queryDate];
  } else {
    sql = 'SELECT * FROM attendance WHERE employee_id = ? ORDER BY `date` DESC, id DESC LIMIT 1';
    params = [employeeId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!results || results.length === 0) {
      return res.json({});
    }

    res.json(results[0]);
  });
};

const getAttendanceLocation = (req, res) => {
  const location = readLocationConfig();
  res.json({ success: true, location });
};

const setAttendanceLocation = (req, res) => {
  const { lat, lon, radius } = req.body;
  if (lat == null || lon == null || radius == null) {
    return res.status(400).json({ success: false, message: 'Latitude, longitude and radius are required' });
  }
  try {
    const saved = writeLocationConfig({ lat, lon, radius });
    return res.json({ success: true, message: 'Office location saved', location: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const markAttendance = (req, res) => {
  const {
    empId,
    student_id,
    employee_id,
    type,
    lat,
    lon,
    mode,
    year,
    month,
    date
  } = req.body;

  if (!type) {
    return res.status(400).json({ success: false, message: 'Attendance type required' });
  }

  const normalizedMode = (mode || 'Biometric').toString();
  if (normalizedMode !== 'Biometric') {
    return res.status(400).json({ success: false, message: 'Only Biometric attendance is allowed' });
  }

  const employeeId = parseIntOrNull(empId || student_id || employee_id);
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'Employee ID required' });
  }

  const normalizedType = type.toString().toUpperCase();
  if (normalizedType !== 'CHECK-IN' && normalizedType !== 'CHECK-OUT') {
    return res.status(400).json({ success: false, message: 'Invalid attendance type' });
  }

  const attendanceDate = date || new Date().toISOString().slice(0, 10);
  const attendanceYear = parseInt(year, 10) || new Date(attendanceDate).getFullYear();
  const attendanceMonth = parseInt(month, 10) || new Date(attendanceDate).getMonth() + 1;
  const now = new Date();
  const timeValue = normalizeTime(now);
  const field = normalizedType === 'CHECK-IN' ? 'check_in' : 'check_out';

  const attendanceLocation = readLocationConfig();
  const employeeSql = 'SELECT name, monthly_salary FROM employees WHERE id = ? LIMIT 1';
  db.query(employeeSql, [employeeId], (empErr, empRows) => {
    if (empErr) {
      return res.status(500).json({ success: false, message: empErr.message });
    }

    const employeeName = empRows && empRows[0] ? empRows[0].name : null;
    const monthlySalary = empRows && empRows[0] ? parseFloat(empRows[0].monthly_salary || 0) : 0;
    const dailySalary = monthlySalary ? parseFloat((monthlySalary / 30).toFixed(2)) : 0;

    const selectSql = 'SELECT * FROM attendance WHERE employee_id = ? AND `date` = ? LIMIT 1';
    db.query(selectSql, [employeeId, attendanceDate], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const existing = rows && rows[0];
      if (existing && existing[field]) {
        return res.status(200).json({
          success: true,
          message: `${normalizedType} already recorded for today`,
          data: existing
        });
      }

      if (existing && existing.mode && mode && existing.mode !== mode) {
        return res.status(400).json({
          success: false,
          message: `Attendance already started by ${existing.mode === 'Manual' ? 'Admin' : 'User'}. You cannot use ${mode === 'Manual' ? 'manual' : 'GPS'} mode today.`
        });
      }

      if (existing && normalizedType === 'CHECK-IN' && existing.check_out) {
        return res.status(400).json({ success: false, message: 'Cannot check in after checkout for today' });
      }

      if (normalizedType === 'CHECK-IN' && mode === 'GPS') {
        const latNum = Number(lat);
        const lonNum = Number(lon);
        if (!latNum || !lonNum) {
          return res.status(400).json({ success: false, message: 'GPS coordinates required for GPS attendance' });
        }
        const distance = getDistanceMeters(latNum, lonNum, attendanceLocation.lat, attendanceLocation.lon);
        if (distance > attendanceLocation.radius) {
          return res.status(400).json({ success: false, message: `GPS attendance only allowed within ${attendanceLocation.radius} meters. You are ${Math.round(distance)} meters away.` });
        }
      }

      const updated = {
        ...existing,
        [field]: timeValue,
        employee_id: employeeId,
        emp_id: empId || student_id || null,
        student_id: student_id || empId || null,
        employee_name: employeeName,
        date: attendanceDate,
        year: attendanceYear,
        month: attendanceMonth,
        mode: normalizedMode || existing?.mode || 'Biometric',
        lat: lat || existing?.lat || null,
        lon: lon || existing?.lon || null,
        updated_at: now
      };

      const checkInTime = updated.check_in || null;
      const checkOutTime = updated.check_out || null;
      const attendanceComputed = computeAttendanceStatus(checkInTime, checkOutTime, dailySalary);
      const finalSalary = checkOutTime ? Math.max(0, dailySalary - attendanceComputed.lateFine) : 0;

      updated.status = attendanceComputed.status;
      updated.attendance_status = attendanceComputed.status;
      updated.late_fine = attendanceComputed.lateFine;
      updated.final_salary = finalSalary;
      updated.day = new Date(attendanceDate).toLocaleDateString('en-GB', { weekday: 'long' });

      if (!existing) {
        const columns = Object.keys(updated).filter((key) => updated[key] !== null && updated[key] !== undefined);
        const placeholders = columns.map(() => '?').join(', ');
        const insertSql = `INSERT INTO attendance (${columns.join(', ')}) VALUES (${placeholders})`;
        const insertParams = columns.map((key) => updated[key]);

        db.query(insertSql, insertParams, (insertErr, insertResult) => {
          if (insertErr) {
            return res.status(500).json({ success: false, message: insertErr.message });
          }
          return res.status(201).json({ success: true, message: 'Attendance recorded', attendanceId: insertResult.insertId });
        });
        return;
      }

      const updateFields = [];
      const updateParams = [];
      for (const key of ['emp_id', 'student_id', 'employee_name', 'date', 'year', 'month', 'day', 'status', 'attendance_status', 'mode', 'lat', 'lon', 'check_in', 'check_out', 'late_fine', 'final_salary', 'updated_at']) {
        if (updated[key] !== null && updated[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateParams.push(updated[key]);
        }
      }
      updateParams.push(employeeId, attendanceDate);

      const updateSql = `UPDATE attendance SET ${updateFields.join(', ')} WHERE employee_id = ? AND \`date\` = ?`;
      db.query(updateSql, updateParams, (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ success: false, message: updateErr.message });
        }

        return res.status(200).json({ success: true, message: 'Attendance updated', data: updated });
      });
    });
  });
};

const adminOverrideAttendance = (req, res) => {
  const { employee_id, date, check_in, check_out, status_override } = req.body;

  if (!employee_id || !date) {
    return res.status(400).json({ success: false, message: 'employee_id and date are required' });
  }

  const attendanceDate = date;
  const now = new Date();

  const employeeSql = 'SELECT name, monthly_salary FROM employees WHERE id = ? LIMIT 1';
  db.query(employeeSql, [employee_id], (empErr, empRows) => {
    if (empErr) return res.status(500).json({ success: false, message: empErr.message });

    const employeeName = empRows?.[0]?.name || null;
    const monthlySalary = parseFloat(empRows?.[0]?.monthly_salary || 0);
    const dailySalary = monthlySalary ? parseFloat((monthlySalary / 30).toFixed(2)) : 0;

    let computed = computeAttendanceStatus(check_in || null, check_out || null, dailySalary);

    if (status_override && status_override !== 'AUTO') {
      computed.status = status_override;
      if (status_override === 'ABSENT' || status_override === 'FULL_CUT') {
        computed.lateFine = dailySalary;
      } else if (status_override === 'HALF_DAY') {
        computed.lateFine = +(dailySalary / 2).toFixed(2);
      } else if (status_override === 'LATE') {
        computed.lateFine = 50; // You can fetch from config if needed
      } else {
        computed.lateFine = 0; // PRESENT, COMPLETED, etc.
      }
    }

    const finalSalary = check_out ? Math.max(0, dailySalary - computed.lateFine) : (status_override ? Math.max(0, dailySalary - computed.lateFine) : 0);
    const dayName = new Date(attendanceDate).toLocaleDateString('en-GB', { weekday: 'long' });

    const selectSql = 'SELECT * FROM attendance WHERE employee_id = ? AND `date` = ? LIMIT 1';
    db.query(selectSql, [employee_id, attendanceDate], (selErr, rows) => {
      if (selErr) return res.status(500).json({ success: false, message: selErr.message });

      const existing = rows?.[0];

      const payload = {
        employee_id,
        employee_name: employeeName,
        date: attendanceDate,
        year: new Date(attendanceDate).getFullYear(),
        month: new Date(attendanceDate).getMonth() + 1,
        day: dayName,
        check_in: check_in || null,
        check_out: check_out || null,
        status: computed.status,
        attendance_status: computed.status,
        late_fine: computed.lateFine,
        final_salary: finalSalary,
        mode: 'Admin',
        updated_at: now
      };

      if (!existing) {
        const cols = Object.keys(payload).filter(k => payload[k] !== null && payload[k] !== undefined);
        const vals = cols.map(k => payload[k]);
        const insertSql = `INSERT INTO attendance (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
        db.query(insertSql, vals, (insErr) => {
          if (insErr) return res.status(500).json({ success: false, message: insErr.message });
          return res.json({ success: true, message: 'Attendance created by admin', data: payload });
        });
      } else {
        const fields = Object.keys(payload).map(k => `${k} = ?`).join(', ');
        const vals = [...Object.values(payload), employee_id, attendanceDate];
        const updateSql = `UPDATE attendance SET ${fields} WHERE employee_id = ? AND \`date\` = ?`;
        db.query(updateSql, vals, (updErr) => {
          if (updErr) return res.status(500).json({ success: false, message: updErr.message });
          return res.json({ success: true, message: 'Attendance overridden by admin', data: payload });
        });
      }
    });
  });
};

module.exports = {
  getMonthlyAttendance,
  getEmployeeAttendance,
  markAttendance,
  adminOverrideAttendance
};

