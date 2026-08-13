import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesRes, empRes, holiRes] = await axios.all([
        axios.get(`${API_BASE_URL}/leaves`),
        axios.get(`${API_BASE_URL}/employees`),
        axios.get(`${API_BASE_URL}/holidays`)
      ]);
      setLeaves(leavesRes.data);
      setEmployeesData(empRes.data);
      setHolidays(holiRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const mappedStatus = status === 'Approve' ? 'Approved' : 'Rejected';
      await axios.put(`${API_BASE_URL}/leaves/${id}`, { status: mappedStatus });
      alert(`Request ${mappedStatus} successfully!`);
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // DYNAMIC CALCULATION LOGIC
  const getLeaveCount = (empId, type) => {
    return leaves.filter(l => l.employeeId === empId && l.type === type && l.status === 'Approved').length;
  };

  const displayEmployees = employeesData.map(e => ({
    ...e,
    sickUsed: getLeaveCount(e.id, 'Sick'),
    sickLimit: 5,
    casualUsed: getLeaveCount(e.id, 'Casual'),
    casualLimit: 5,
    paidUsed: getLeaveCount(e.id, 'Paid'),
    paidLimit: 10
  }));

  // Pagination logic for display
  const finalList = showAll ? displayEmployees : displayEmployees.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen space-y-8">
      {/* 1. EMPLOYEE LEAVE LEDGER */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-sm overflow-x-auto">
        <h2 className="text-lg font-black text-violet-950 mb-6">Employee Leave Ledger</h2>
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase border-b border-slate-100">
              <th className="pb-4">Employee</th>
              <th className="pb-4">Sick (Used/Limit)</th>
              <th className="pb-4">Casual (Used/Limit)</th>
              <th className="pb-4">Paid (Used/Limit)</th>
            </tr>
          </thead>
          <tbody>
            {finalList.map((e, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-4 font-black text-sm">{e.name}</td>
                <td className="py-4 font-bold text-violet-600">{e.sickUsed}/{e.sickLimit}</td>
                <td className="py-4 font-bold text-violet-600">{e.casualUsed}/{e.casualLimit}</td>
                <td className="py-4 font-bold text-violet-600">{e.paidUsed}/{e.paidLimit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {employeesData.length > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="mt-6 w-full py-3 bg-slate-100 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
          >
            {showAll ? "Show Less" : "View All Employees"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. APPROVAL WORKFLOW */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-sm">
          <h2 className="text-lg font-black text-violet-950 mb-6">Pending Approvals</h2>
          <div className="h-96 overflow-y-auto pr-2">
            {leaves.length > 0 ? leaves.map(l => (
              <div key={l._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 bg-slate-50 rounded-2xl mb-4 border">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-black text-sm">{l.employeeName}</p>
                    <span className={`text-[10px] font-black uppercase rounded-full px-3 py-1 ${l.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : l.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {l.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">{l.type} • {l.reason}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {l.status === 'Pending' ? (
                    <>
                      <button onClick={() => handleAction(l._id, 'Approve')} className="bg-green-100 text-green-700 px-4 py-1.5 rounded-lg font-black text-[10px] hover:bg-green-200 transition">APPROVE</button>
                      <button onClick={() => handleAction(l._id, 'Reject')} className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg font-black text-[10px] hover:bg-red-200 transition">REJECT</button>
                    </>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-4 py-2 rounded-full bg-slate-100 text-slate-600">No actions available</span>
                  )}
                </div>
              </div>
            )) : <p className="text-slate-400 font-bold text-sm">No pending requests.</p>}
          </div>
        </div>

        {/* 3. UPCOMING HOLIDAYS */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-sm h-[480px]">
          <h2 className="text-lg font-black text-violet-950 mb-6">Upcoming Holidays</h2>
          <div className="h-[380px] overflow-y-auto pr-2 space-y-4">
            {holidays.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-violet-50 rounded-2xl border-l-4 border-violet-500">
                <div className="text-center">
                  <p className="text-[10px] font-black text-violet-600">{h.date?.split(' ')[0]}</p>
                  <p className="text-lg font-black">{h.date?.split(' ')[1]}</p>
                </div>
                <p className="font-black text-sm">{h.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
