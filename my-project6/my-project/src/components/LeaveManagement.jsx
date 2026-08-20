import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");

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

  const getLeaveCount = (empId) => {
    return leaves.filter(l => l.employeeId === empId && l.status === 'Approved').length;
  };

  const displayEmployees = employeesData.map(e => ({
    ...e,
    leavesUsed: getLeaveCount(e.id)
  }));

  const filteredEmployees = displayEmployees.filter(e => 
    (e.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaves = leaves.filter(l => 
    (l.employeeName || '').toLowerCase().includes(pendingSearchTerm.toLowerCase())
  );

  const finalList = showAll ? filteredEmployees : filteredEmployees.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen space-y-8">
      
      {/* 1. EMPLOYEE LEAVE LEDGER */}
      <div className="bg-white p-6 lg:p-8 rounded-[32px] border shadow-sm overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h2 className="text-xl font-black text-violet-950">Employee Leave Ledger</h2>
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-violet-500 w-full"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            )}
          </div>
        </div>
        
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="text-slate-400 text-[11px] font-black uppercase tracking-wider border-b-2 border-slate-100">
              <th className="pb-4 pl-2">Employee Name</th>
              <th className="pb-4 text-right pr-2">Leaves Taken (Paid)</th>
            </tr>
          </thead>
          <tbody>
            {finalList.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-8 text-center text-slate-400 font-bold text-sm">No employees found.</td>
              </tr>
            ) : (
              finalList.map((e, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="py-5 pl-2 font-black text-slate-800 text-sm">{e.name}</td>
                  <td className="py-5 pr-2 font-black text-violet-600 text-base text-right">{e.leavesUsed} <span className="text-xs font-bold text-slate-400">taken</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {filteredEmployees.length > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="mt-6 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition"
          >
            {showAll ? "Show Less" : "View All Employees"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. APPROVAL WORKFLOW */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-[32px] border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h2 className="text-xl font-black text-violet-950">Pending Approvals</h2>
            <div className="relative w-full sm:w-72">
              <input 
                type="text" 
                placeholder="Search requests..." 
                value={pendingSearchTerm}
                onChange={(e) => setPendingSearchTerm(e.target.value)}
                className="p-3 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-violet-500 w-full"
              />
              {pendingSearchTerm && (
                <button onClick={() => setPendingSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold">
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto pr-2 space-y-4">
            {filteredLeaves.length > 0 ? filteredLeaves.map(l => (
              <div key={l._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 gap-4 hover:shadow-md transition">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-black text-slate-800 text-sm">{l.employeeName}</p>
                    <span className={`text-[10px] font-black uppercase tracking-wider rounded-full px-3 py-1 
                      ${l.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                        l.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {l.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold"><span className="text-slate-400">For:</span> {l.date} • {l.reason}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {l.status === 'Pending' ? (
                    <>
                      <button onClick={() => handleAction(l._id, 'Approve')} className="bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-xl font-black text-[11px] hover:bg-emerald-200 transition">APPROVE</button>
                      <button onClick={() => handleAction(l._id, 'Reject')} className="bg-red-100 text-red-700 px-5 py-2.5 rounded-xl font-black text-[11px] hover:bg-red-200 transition">REJECT</button>
                    </>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-4 py-2 rounded-full bg-white text-slate-400 border">No actions available</span>
                  )}
                </div>
              </div>
            )) : <p className="text-slate-400 font-bold text-sm text-center py-10">No pending requests.</p>}
          </div>
        </div>

        {/* 3. UPCOMING HOLIDAYS */}
        <div className="bg-white p-6 lg:p-8 rounded-[32px] border shadow-sm flex flex-col h-[520px]">
          <h2 className="text-xl font-black text-violet-950 mb-8">Manage Holidays</h2>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const name = e.target.holidayName.value;
            const date = e.target.holidayDate.value;
            if(!name || !date) return alert("Please fill all fields");
            try {
              await axios.post(`${API_BASE_URL}/holidays`, { name, date });
              e.target.reset();
              fetchData();
            } catch(err) { alert("Error adding holiday"); }
          }} className="mb-6 flex flex-col gap-3">
            <input type="text" name="holidayName" placeholder="Holiday Name (e.g. Diwali)" className="p-3 bg-slate-50 border rounded-2xl text-sm font-bold outline-none focus:border-violet-500" required />
            <div className="flex gap-2">
              <input type="date" name="holidayDate" className="p-3 bg-slate-50 border rounded-2xl text-sm font-bold outline-none focus:border-violet-500 w-full" required />
              <button type="submit" className="bg-violet-900 text-white px-5 py-3 rounded-2xl text-sm font-black shrink-0 hover:bg-black transition">ADD</button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {holidays.length === 0 ? (
              <p className="text-center text-sm text-slate-400 font-bold py-10">No holidays added.</p>
            ) : holidays.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-violet-50 rounded-2xl border-l-4 border-violet-500">
                <div className="flex items-center gap-4">
                  <div className="text-center shrink-0 min-w-[44px]">
                    <p className="text-[10px] font-black uppercase text-violet-600 tracking-widest">{h.date?.split(' ')[0]}</p>
                    <p className="text-xl font-black text-violet-950">{h.date?.split(' ')[1]}</p>
                  </div>
                  <div>
                    <p className="font-black text-sm text-violet-950">{h.name}</p>
                    {h.full_date && <p className="text-[10px] text-violet-500/80 font-bold mt-0.5">{h.full_date}</p>}
                  </div>
                </div>
                {h.id && (
                  <button onClick={async () => {
                    const confirm = await window.confirm("Delete this holiday?");
                    if(!confirm) return;
                    try {
                      await axios.delete(`${API_BASE_URL}/holidays/${h.id}`);
                      fetchData();
                    } catch(e) { alert("Error deleting"); }
                  }} className="text-red-400 hover:text-red-600 bg-white p-2 rounded-xl shadow-sm transition">
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
