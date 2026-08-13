import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';

export default function Attendance() {
  const { employeesList } = useOutletContext();
  const [records, setRecords] = useState({});
  const [allRecords, setAllRecords] = useState([]);
  const [loadingMap, setLoadingMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterDate, setFilterDate] = useState(null);
  const [dayFilter, setDayFilter] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [clockNow, setClockNow] = useState(new Date());
  const STORAGE_KEY = 'manualAttendanceRecords';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const getBucketKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const buildDateCounts = (recordsListOrObj, year, month, empId) => {
    const counts = {};
    if (!recordsListOrObj) return counts;
    const consider = (rec) => {
      if (!rec || !rec.date) return;
      const d = new Date(rec.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    };

    const list = Array.isArray(recordsListOrObj)
      ? recordsListOrObj
      : Object.values(recordsListOrObj || {}).flat();

    list.forEach((rec) => {
      const id = rec.employeeId || rec.employee_id || rec.empId || rec.student_id;
      if (empId && Number(id) !== Number(empId)) return;
      consider(rec);
    });
    return counts;
  };

  const parseAttendanceTime = (value, dateString) => {
    if (!value) return null;
    if (typeof value !== 'string') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const iso = new Date(value);
    if (!Number.isNaN(iso.getTime())) return iso;
    const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return null;
    const [, h, m, s = '00'] = match;
    let dateValue = dateString || '';
    if (dateValue.includes('T')) dateValue = dateValue.split('T')[0];
    const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(Number(h), Number(m), Number(s), 0);
    return date;
  };

  const calculateWorkHours = (inTime, outTime, dateString) => {
    const start = parseAttendanceTime(inTime, dateString);
    const end = parseAttendanceTime(outTime, dateString);
    if (!start || !end) return '--';
    let totalMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (totalMinutes < 0) totalMinutes = Math.abs(totalMinutes);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  // Deduction logic:
  // - If check-in time is after 09:35 and up to 11:00 => deduct ₹50
  // - If check-in time is after 11:00 => mark half-day and deduct half of per-day salary
  // Assumption: per-day salary = monthly_salary / 30
  const computeDeduction = (emp, rec) => {
    try {
      if (!emp || !rec || !rec.checkIn) return { amount: 0, type: 'NONE' };
      const monthly = Number(emp.monthly_salary || emp.monthlySalary || emp.salary || 0);
      const perDay = monthly && !Number.isNaN(monthly) ? monthly / 30 : 0;
      const checkIn = parseAttendanceTime(rec.checkIn || rec.check_in, rec.date);
      if (!checkIn) return { amount: 0, type: 'NONE' };

      const minutes = checkIn.getHours() * 60 + checkIn.getMinutes();
      const lateBoundary = 9 * 60 + 35; // 09:35 -> after this is considered late
      const halfBoundary = 11 * 60; // 11:00 -> after this is half-day

      if (minutes > halfBoundary) {
        const amt = +(perDay / 2).toFixed(2);
        return { amount: amt, type: 'HALF_DAY' };
      }
      if (minutes > lateBoundary && minutes <= halfBoundary) {
        return { amount: 50, type: 'LATE' };
      }
      return { amount: 0, type: 'NONE' };
    } catch (e) {
      return { amount: 0, type: 'NONE' };
    }
  };

  const getDayName = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  };

  const getMonthNameFromDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--';
    return monthNames[date.getMonth()] || '--';
  };

  const getYearFromDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--';
    return date.getFullYear();
  };

  const getEventStatus = (rec) => {
    if (!rec) return '--';
    if (rec.checkOut || rec.check_out) return 'OUT';
    if (rec.checkIn || rec.check_in) return 'IN';
    return '--';
  };

  const getAttendanceLabel = (rec) => {
    if (!rec || (!rec.checkIn && !rec.check_in && !rec.checkOut && !rec.check_out && !rec.status && !rec.attendance_status)) {
      return filterDate ? 'ABSENT' : '--';
    }
    const statusText = (rec.status || rec.attendance_status || '').toString().trim().toUpperCase();
    if (['OUT', 'IN', 'COMPLETED', 'PRESENT'].includes(statusText)) {
      return 'PRESENT';
    }
    if (['HALF_DAY', 'LATE', 'ABSENT'].includes(statusText)) {
      return statusText;
    }
    if (rec.checkIn || rec.check_in || rec.checkOut || rec.check_out) {
      return 'PRESENT';
    }
    return filterDate ? 'ABSENT' : '--';
  };

  const readManualRecords = (year, month) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return all[getBucketKey(year, month)] || {};
    } catch {
      return {};
    }
  };

  const saveManualRecords = (year, month, data) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      all[getBucketKey(year, month)] = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ [getBucketKey(year, month)]: data }));
    }
  };

  const normalizeAttendanceItem = (item) => {
    if (!item) return null;
    const checkIn = item.check_in || item.checkIn || null;
    const checkOut = item.check_out || item.checkOut || null;
    const key = item.employee_id || item.empId || item.student_id || item.id;
    return {
      ...item,
      employeeId: key,
      checkIn,
      checkOut,
      status: item.status || item.attendance_status || item.status,
      day: item.day || item.day,
      mode: item.mode || item.mode,
      date: item.date || item.date
    };
  };

  const normalizeRemoteRecords = (data) => {
    if (!data) return {};
    if (Array.isArray(data)) {
      return data.reduce((acc, item) => {
        const normalized = normalizeAttendanceItem(item);
        if (!normalized?.employeeId) return acc;
        const existing = acc[normalized.employeeId];
        if (!existing) {
          acc[normalized.employeeId] = normalized;
          return acc;
        }

        acc[normalized.employeeId] = {
          ...existing,
          ...normalized,
          checkIn: existing.checkIn || normalized.checkIn,
          checkOut: existing.checkOut || normalized.checkOut,
          date: existing.date || normalized.date,
          status: normalized.status || existing.status,
          mode: normalized.mode || existing.mode,
        };
        return acc;
      }, {});
    }
    if (typeof data === 'object') {
      const normalized = normalizeAttendanceItem(data);
      return normalized?.employeeId ? { [normalized.employeeId]: normalized } : {};
    }
    return {};
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const getActorRole = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      if (!u) return 'ADMIN';
      return (u.role || u.position || (u.isAdmin ? 'ADMIN' : 'EMPLOYEE')).toString().toUpperCase();
    } catch (e) {
      return 'ADMIN';
    }
  };

  const fetchAttendanceData = async (month) => {
    const manual = readManualRecords(selectedYear, month);
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance/today`, {
        params: { year: selectedYear, month: month + 1 }
      });
      const remote = normalizeRemoteRecords(res.data);
      // Prefer remote DB records over any local manual cache
      setRecords({ ...manual, ...remote });

      const normalizedList = Array.isArray(res.data)
        ? res.data.map(normalizeAttendanceItem)
        : [];
      const manualList = Object.values(manual);
      setAllRecords([...manualList, ...normalizedList]);
    } catch (err) {
      console.error('Data sync error', err);
      setRecords(manual);
      setAllRecords(Object.values(manual));
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedMonth);
    const interval = setInterval(() => fetchAttendanceData(selectedMonth), 5000);
    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear]);

  // Live clock for the header — purely cosmetic, not tied to fetch logic
  useEffect(() => {
    const tick = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const getEmployeeRecord = (emp) => {
    const empId = String(emp.id || emp.employee_id || emp.empId || emp.student_id || '');
    const empRecords = allRecords
      .filter(r => String(r.employeeId || r.employee_id || r.empId || r.student_id || '') === empId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filterDate) {
      return empRecords.find(r => formatLocalDate(r.date) === filterDate) || {};
    }
    return empRecords[0] || {};
  };

  const filteredEmployees = employeesList
    .filter((emp) => emp.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .filter((emp) => (!selectedEmployeeId ? true : String(emp.id) === String(selectedEmployeeId)))
    .filter((emp) => {
      const rec = getEmployeeRecord(emp);
      if (filterDate) return true;
      if (dayFilter && getDayName(rec.date) !== dayFilter) return false;
      return true;
    });

  const attendanceSummary = filteredEmployees.reduce((summary, emp) => {
    const rec = getEmployeeRecord(emp);
    summary.total += 1;
    const status = (rec.status || rec.attendance_status || '').toString().toUpperCase();
    if (status === 'LATE') summary.late += 1;
    else if (status === 'HALF_DAY') summary.halfDay += 1;
    else if (status === 'ABSENT' || (!rec.date && filterDate)) summary.absent += 1;
    else if (status === 'COMPLETED' || status === 'IN' || status === 'OUT') summary.onTime += 1;
    return summary;
  }, { total: 0, onTime: 0, late: 0, halfDay: 0, absent: 0 });

  const handleAction = async (empId, type) => {
    setLoadingMap((prev) => ({ ...prev, [empId]: true }));
    const currentTime = getCurrentTime();
    const updatedRecords = { ...records };
    const rec = { ...updatedRecords[empId] };
    const actorRole = getActorRole();

    // Prevent marking if the other party already marked
    if (rec.markedBy && rec.markedBy !== actorRole) {
      alert(`Attendance already marked by ${rec.markedBy}. You cannot override.`);
      setLoadingMap((prev) => ({ ...prev, [empId]: false }));
      return;
    }

    if (type === 'CHECK-IN') {
      rec.checkIn = currentTime;
      rec.status = 'IN';
      rec.mode = 'Biometric';
      rec.markedBy = actorRole;
    } else {
      rec.checkOut = currentTime;
      rec.status = rec.checkIn ? 'COMPLETED' : 'OUT';
      rec.mode = 'Biometric';
      rec.markedBy = actorRole;
    }

    rec.date = filterDate || rec.date || new Date().toISOString().slice(0, 10);
    rec.employeeId = empId;
    updatedRecords[empId] = rec;
    setRecords(updatedRecords);
    setAllRecords((prev) => {
      const filtered = prev.filter(r => String(r.employeeId || r.employee_id) !== String(empId));
      return [...filtered, rec];
    });
    saveManualRecords(selectedYear, selectedMonth, updatedRecords);

    try {
      await axios.post(`${API_BASE_URL}/attendance/mark`, {
        empId,
        student_id: empId,
        type,
        mode: 'Manual',
        actor: actorRole,
        year: selectedYear,
        month: selectedMonth + 1,
        date: rec.date
      });
      // On success remove local manual entry so DB becomes authoritative
      try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const bucketKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const bucket = all[bucketKey] || {};
        if (bucket[empId]) {
          delete bucket[empId];
          all[bucketKey] = bucket;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        }
      } catch (e) {}
      alert(`${type} Success!`);
      fetchAttendanceData(selectedMonth);
    } catch (err) {
      alert('Manual record saved locally.');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [empId]: false }));
    }
  };

  // --- Presentation-only helpers (no business logic here) ---
  const initials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

  const statusFlag = (status) => {
    if (status === 'LATE') return 'border-l-amber-400';
    if (status === 'HALF_DAY') return 'border-l-rose-400';
    if (status === 'ABSENT') return 'border-l-red-400';
    if (status === 'PRESENT' || status === 'COMPLETED' || status === 'IN' || status === 'OUT') return 'border-l-emerald-400';
    return 'border-l-slate-200';
  };

  const statusPill = (status) => {
    const map = {
      LATE: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      HALF_DAY: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
      ABSENT: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      PRESENT: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      IN: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
      OUT: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    };
    return map[status] || 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
  };

  const clockDigits = clockNow.toLocaleTimeString('en-GB', { hour12: false });

  return (
    <div className="min-h-screen bg-[#F6F5FB] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page header — matches the dashboard's plain header + live pill, no heavy banner */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
              HR · Monthly Ledger
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-800">Attendance</h1>
            <p className="mt-1 text-sm text-slate-500">
              Every check-in, check-out and fine, entered against the day it happened.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live · {clockDigits}
            </span>
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
          </div>
        </div>

        {/* Summary cards — same card language as the dashboard's stat tiles */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Entries today', value: attendanceSummary.total, accent: 'text-slate-800' },
            { label: 'On time', value: attendanceSummary.onTime, accent: 'text-emerald-600' },
            { label: 'Late arrivals', value: attendanceSummary.late, accent: 'text-amber-600' },
            { label: 'Half-day', value: attendanceSummary.halfDay, accent: 'text-rose-600' },
            { label: 'Absent', value: attendanceSummary.absent, accent: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-400">{s.label}</p>
              <p className={`mt-2 text-2xl font-bold ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter toolbar */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Search employee
              </label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type a name…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Employee
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">All employees</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Date
              </label>
              <input
                type="date"
                value={filterDate || ''}
                onChange={(e) => setFilterDate(e.target.value || null)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Day
              </label>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">All days</option>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {(searchTerm || filterDate || dayFilter || selectedEmployeeId) && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400">Filters applied — showing a subset of the register.</p>
              <button
                onClick={() => { setSearchTerm(''); setFilterDate(null); setDayFilter(''); setSelectedEmployeeId(''); }}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Register table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="w-12 px-4 py-3 whitespace-nowrap">No.</th>
                  <th className="px-4 py-3 whitespace-nowrap">Employee</th>
                  <th className="px-4 py-3 whitespace-nowrap">Salary / day</th>
                  <th className="px-4 py-3 whitespace-nowrap">Fine</th>
                  <th className="px-4 py-3 whitespace-nowrap">Day</th>
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">In</th>
                  <th className="px-4 py-3 whitespace-nowrap">Out</th>
                  <th className="px-4 py-3 whitespace-nowrap">Hours</th>
                  <th className="px-4 py-3 whitespace-nowrap">Event</th>
                  <th className="px-4 py-3 whitespace-nowrap">Attendance</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeesList
                  .filter((emp) => emp.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
                  .filter((emp) => (!selectedEmployeeId ? true : String(emp.id) === String(selectedEmployeeId)))
                  .filter((emp) => {
                    const empRecords = allRecords.filter(r => String(r.employeeId || r.employee_id) === String(emp.id));
                    if (filterDate) return true;
                    if (dayFilter && !empRecords.some(r => getDayName(r.date) === dayFilter)) return false;
                    return true;
                  })
                  .map((emp, idx) => {
                    const empRecords = allRecords.filter(r => String(r.employeeId || r.employee_id) === String(emp.id));
                    const rec = filterDate
                      ? empRecords.find(r => formatLocalDate(r.date) === filterDate) || {}
                      : empRecords[0] || {};
                    const rawCheckIn = rec.checkIn || rec.check_in || '';
                    const checkInValue = rawCheckIn;
                    const checkOutValue = rec.checkOut || rec.check_out || '';
                    const hours = checkInValue && checkOutValue ? calculateWorkHours(checkInValue, checkOutValue, rec.date) : '--';
                    const actorRole = getActorRole();
                    const isLocked = rec.mode === 'Biometric' || rec.mode === 'GPS' || (rec.markedBy && rec.markedBy !== actorRole);
                    const loading = loadingMap[emp.id];
                    const eventStatus = getEventStatus(rec);
                    const attendanceStatus = getAttendanceLabel(rec);
                    const ded = computeDeduction(emp, rec);

                    return (
                      <tr
                        key={emp.id}
                        className={`border-l-4 bg-white ${statusFlag(rec.status || rec.attendance_status || attendanceStatus)} transition-colors even:bg-slate-50/50 hover:bg-violet-50/40`}
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-semibold text-white">
                              {initials(emp.name)}
                            </div>
                            <span className="whitespace-nowrap font-medium text-slate-800">{emp.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">
                          {emp.monthly_salary ? `₹${(Number(emp.monthly_salary) / 30).toFixed(2)}`
                            : emp.monthlySalary ? `₹${(Number(emp.monthlySalary) / 30).toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {!ded || ded.amount === 0 ? (
                            <span className="text-xs font-medium text-emerald-600">No fine</span>
                          ) : (
                            <span className="font-mono text-xs font-semibold text-rose-600">−₹{ded.amount}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{getDayName(rec.date)}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">{formatLocalDate(rec.date) || '--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">{rec.checkIn || rec.check_in || '--:--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">{rec.checkOut || rec.check_out || '--:--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-indigo-700">{hours}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(eventStatus)}`}>
                            {eventStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(attendanceStatus)}`}>
                            {attendanceStatus === '--' ? 'Not marked' : attendanceStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                            Biometric only
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                {employeesList.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-sm text-slate-400">
                      No employees on record yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Refreshes automatically every 5 seconds · manual entries sync once the server confirms them.
        </p>
      </div>
    </div>
  );
}
