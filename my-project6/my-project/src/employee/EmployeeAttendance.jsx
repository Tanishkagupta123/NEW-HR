import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeeAttendance() {
  const [userStatus, setUserStatus] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterDate, setFilterDate] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const buildStatusSummary = (status) => {
    if (!status) return { present: 0, absent: 1, percent: 0 };
    const value = typeof status === 'string'
      ? status
      : status.status || status.attendance_status || '';
    const normalizedStatus = value.toString().toUpperCase();
    if (['COMPLETED', 'IN', 'OUT', 'LATE', 'HALF_DAY'].includes(normalizedStatus)) {
      return { present: 1, absent: 0, percent: 100 };
    }
    if (normalizedStatus === 'ABSENT') {
      return { present: 0, absent: 1, percent: 0 };
    }
    if (status.checkIn) {
      return { present: 1, absent: 0, percent: 100 };
    }
    return { present: 0, absent: 1, percent: 0 };
  };

  const parseAttendanceTime = (value) => {
    if (!value || typeof value !== 'string') return null;
    const isoDate = new Date(value);
    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate;
    }
    const timeMatch = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const [, hour, minute, second = '0'] = timeMatch;
      const date = new Date();
      date.setHours(Number(hour), Number(minute), Number(second), 0);
      return date;
    }
    return null;
  };

  const calculateWorkHours = (inTime, outTime) => {
    const start = parseAttendanceTime(inTime);
    const end = parseAttendanceTime(outTime);
    if (!start || !end) return '--';
    let diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (diffMinutes < 0) diffMinutes = Math.abs(diffMinutes);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const normalizeStatus = (raw) => {
    if (!raw) return null;
    const checkIn = raw.check_in || raw.checkIn || null;
    const checkOut = raw.check_out || raw.checkOut || null;
    const status = raw.status || raw.attendance_status || raw.status || null;
    const normalized = {
      ...raw,
      checkIn,
      checkOut,
      status,
      date: raw.date || raw.date,
      mode: raw.mode || raw.mode,
      workHours: calculateWorkHours(checkIn, checkOut)
    };
    return {
      ...normalized,
      ...buildStatusSummary(normalized)
    };
  };


  const getYYYYMMDD = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (!Number.isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const r = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${r}`;
      }
    } catch (e) {}
    return '';
  };


  const fetchMonthlyAttendance = async (year, month) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance/today`, {
        params: { year, month: month + 1 }
      });
      const filtered = Array.isArray(res.data) ? res.data.filter((item) => {
        const id = item.employee_id || item.empId || item.student_id || item.id;
        return Number(id) === Number(user.id);
      }) : [];
      setAttendanceRecords(filtered);
    } catch (err) {
      console.error('Monthly attendance fetch failed', err);
      setAttendanceRecords([]);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance/employee/${user.id}`);
      if (res.data && (res.data.check_in || res.data.check_out || res.data.status || res.data.attendance_status)) {
        setUserStatus(normalizeStatus(res.data));
        return;
      }
    } catch (err) {
      console.error("Error fetching status", err);
    }

    setUserStatus(null);
  };

  useEffect(() => { fetchStatus(); }, []);
  useEffect(() => { fetchMonthlyAttendance(selectedYear, selectedMonth); }, [selectedYear, selectedMonth]);

  const findRecordForDate = (dateStr) => {
    if (!dateStr) return null;
    const match = (attendanceRecords || []).find((rec) => {
      if (!rec?.date) return false;
      return getYYYYMMDD(rec.date) === dateStr;
    });
    return match ? normalizeStatus(match) : null;
  };

  const filteredRecords = attendanceRecords.filter((rec) => {
    const key = getYYYYMMDD(rec?.date);
    if (filterDate && key !== filterDate) return false;
    if (dayFilter) {
      const dayName = new Date(rec.date).toLocaleDateString('en-GB', { weekday: 'short' });
      return dayName === dayFilter;
    }
    return true;
  });

  const displayStatus = filterDate
    ? (findRecordForDate(filterDate) || { present: 0, absent: 1, percent: 0, checkIn: null, checkOut: null, workHours: '--', status: 'ABSENT' })
    : (userStatus || { present: 0, absent: 1, percent: 0, checkIn: null, checkOut: null, workHours: '--', status: 'ABSENT' });

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-3xl border shadow-sm text-center">
      <h2 className="text-2xl font-black text-violet-950 mb-6">My Attendance</h2>

      <div className="grid gap-4 mb-6 md:grid-cols-5">
        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-2">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-2">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold"
          >
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((month, idx) => (
              <option key={month} value={idx}>{month}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-2">Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-2">Day</label>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold"
          >
            <option value="">All days</option>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setFilterDate(''); setDayFilter(''); }}
            className="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* SUMMARY DASHBOARD */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-green-50 p-3 rounded-2xl border border-green-100">
          <p className="text-[9px] text-green-600 font-black uppercase">Present</p>
          <p className="text-xl font-black text-green-700">{displayStatus?.present || 0}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
          <p className="text-[9px] text-red-600 font-black uppercase">Absent</p>
          <p className="text-xl font-black text-red-700">{displayStatus?.absent || 0}</p>
        </div>
        <div className="bg-violet-50 p-3 rounded-2xl border border-violet-100">
          <p className="text-[9px] text-violet-600 font-black uppercase">Rate</p>
          <p className="text-xl font-black text-violet-700">{displayStatus?.percent || 0}%</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mb-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 whitespace-nowrap">#</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Day</th>
                <th className="px-4 py-3 whitespace-nowrap">Check In</th>
                <th className="px-4 py-3 whitespace-nowrap">Check Out</th>
                <th className="px-4 py-3 whitespace-nowrap">Hours</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.length > 0 ? filteredRecords.map((rec, idx) => {
                const statusText = (rec.status || rec.attendance_status || 'ABSENT').toString().toUpperCase();
                const dayName = rec?.date ? new Date(rec.date).toLocaleDateString('en-GB', { weekday: 'short' }) : '--';
                return (
                  <tr key={getYYYYMMDD(rec.date) || rec.id || idx} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{idx + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{getYYYYMMDD(rec.date) || 'Unknown'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{dayName}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-700">{rec.checkIn || rec.check_in || '--:--'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-700">{rec.checkOut || rec.check_out || '--:--'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{rec.workHours || '--'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                        statusText === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        statusText === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                        statusText === 'HALF_DAY' ? 'bg-orange-100 text-orange-800' :
                        statusText === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>{statusText}</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">No attendance records match the selected filters. Use year, month, date, or day filters to view biometric attendance records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

