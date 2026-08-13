import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

export default function MarkAttendance() {
  const { employeesList } = useOutletContext();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [attendanceMode, setAttendanceMode] = useState('CHECK-IN');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMark = async () => {
    if (!selectedEmployeeId) {
      setMessage('Please select an employee first.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/attendance/mark`, {
        empId: selectedEmployeeId,
        type: attendanceMode,
        mode: 'Biometric'
      });
      setMessage(res.data.message || 'Attendance marked successfully.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Attendance mark failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-4xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 font-semibold">Admin Action</p>
              <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Mark Attendance</h1>
              <p className="mt-2 text-sm text-slate-600">Use this page only for manual attendance marking. The main Attendance page remains view-only.</p>
            </div>
            <div className="rounded-full bg-violet-600 px-4 py-2 text-white text-sm font-semibold">Admin Only</div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">Select employee</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Action</label>
              <select
                value={attendanceMode}
                onChange={(e) => setAttendanceMode(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="CHECK-IN">CHECK-IN</option>
                <option value="CHECK-OUT">CHECK-OUT</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleMark}
              disabled={loading}
              className="rounded-3xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200/30 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : 'Mark Attendance'}
            </button>
            {message && (
              <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 border border-slate-200">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
