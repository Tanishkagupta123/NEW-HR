import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeeLeave() {
  const [leave, setLeave] = useState({ type: 'Paid', reason: '', date: '' });
  const [balance, setBalance] = useState({ leavesUsed: 0 });
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const calculateBalance = (leaveHistory) => {
    let used = 0;
    leaveHistory.forEach((item) => {
      if (item.status === 'Approved') {
        used += 1;
      }
    });
    return { leavesUsed: used };
  };

  const fetchData = async () => {
    try {
      const histRes = await axios.get(`${API_BASE_URL}/leaves/employee/${user.id}`);
      const historyData = histRes.data || [];
      setHistory(historyData);
      setBalance(calculateBalance(historyData));
    } catch (err) {
      console.error("Data fetch error", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/leaves`, {
        ...leave,
        type: 'Paid',
        employeeName: user.name,
        employeeId: user.id,
        status: 'Pending'
      });
      alert("Leave request submitted! Waiting for Admin approval.");
      setLeave({ type: 'Paid', reason: '', date: '' });
      fetchData();
    } catch (err) { alert("Failed to apply"); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* 1. MODERN LEAVE LEDGER */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-violet-950 mb-6">Your Leave Ledger</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Leaves Taken</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-black">{balance.leavesUsed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. APPLY FORM */}
      <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-black text-violet-950 mb-6">Apply for Leave</h2>
        <form onSubmit={handleApply} className="space-y-6">
          <input type="date" value={leave.date} required className="w-full p-4 bg-slate-50 rounded-2xl border outline-none font-bold" onChange={(e) => setLeave({...leave, date: e.target.value})} />
          <textarea placeholder="Reason for leave" required value={leave.reason} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none font-bold" onChange={(e) => setLeave({...leave, reason: e.target.value})} />
          <button type="submit" className="w-full bg-violet-900 text-white py-4 rounded-2xl font-black hover:bg-black transition">Submit Request</button>
        </form>
      </div>

      {/* 3. LEAVE STATUS HISTORY */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-violet-950 mb-4">Request History</h2>
        {history.length === 0 ? (
          <p className="text-slate-400 font-bold text-sm">No leave history found.</p>
        ) : (
          history.map((h, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between p-4 border-b border-slate-50 gap-2">
              <div>
                <p className="font-bold text-slate-800">{h.date}</p>
                <p className="text-xs text-slate-500 mt-1">{h.reason}</p>
              </div>
              <span className={`font-black uppercase text-[10px] sm:self-center ${h.status === 'Approved' ? 'text-green-500' : h.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                {h.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
