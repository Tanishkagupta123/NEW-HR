import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeeLeave() {
  const [leave, setLeave] = useState({ type: 'Sick', reason: '', date: '' });
  const [balance, setBalance] = useState({ sickUsed: 0, sickLimit: 5, casualUsed: 0, casualLimit: 5, paidUsed: 0, paidLimit: 10 });
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const calculateBalance = (leaveHistory) => {
    const result = { sickUsed: 0, sickLimit: 5, casualUsed: 0, casualLimit: 5, paidUsed: 0, paidLimit: 10 };
    leaveHistory.forEach((item) => {
      if (item.status === 'Approved') {
        if (item.type === 'Sick') result.sickUsed += 1;
        if (item.type === 'Casual') result.casualUsed += 1;
        if (item.type === 'Paid') result.paidUsed += 1;
      }
    });
    return result;
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
        employeeName: user.name,
        employeeId: user.id,
        status: 'Pending'
      });
      alert("Leave request submitted! Waiting for Admin approval.");
      setLeave({ type: 'Sick', reason: '', date: '' });
      fetchData();
    } catch (err) { alert("Failed to apply"); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* 1. MODERN LEAVE LEDGER */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-violet-950 mb-6">Your Leave Ledger</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Sick', used: balance.sickUsed ?? 0, limit: balance.sickLimit ?? 5, color: 'from-rose-500 to-orange-400' },
            { label: 'Casual', used: balance.casualUsed ?? 0, limit: balance.casualLimit ?? 5, color: 'from-blue-500 to-cyan-400' },
            { label: 'Paid', used: balance.paidUsed ?? 0, limit: balance.paidLimit ?? 10, color: 'from-violet-600 to-indigo-500' },
          ].map((item, i) => (
            <div key={i} className={`p-6 rounded-3xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{item.label} Balance</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black">{item.used}</p>
                <p className="text-xl font-bold opacity-70">/ {item.limit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. APPLY FORM */}
      <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-black text-violet-950 mb-6">Apply for Leave</h2>
        <form onSubmit={handleApply} className="space-y-6">
          <select className="w-full p-4 bg-slate-50 rounded-2xl border outline-none font-bold" onChange={(e) => setLeave({...leave, type: e.target.value})}>
            <option value="Sick">Sick Leave</option>
            <option value="Casual">Casual Leave</option>
            <option value="Paid">Paid Leave</option>
          </select>
          <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none font-bold" onChange={(e) => setLeave({...leave, date: e.target.value})} />
          <textarea placeholder="Reason for leave" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none font-bold" onChange={(e) => setLeave({...leave, reason: e.target.value})} />
          <button type="submit" className="w-full bg-violet-900 text-white py-4 rounded-2xl font-black hover:bg-black transition">Submit Request</button>
        </form>
      </div>

      {/* 3. LEAVE STATUS HISTORY */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-violet-950 mb-4">Request History</h2>
        {history.map((h, i) => (
          <div key={i} className="flex justify-between p-4 border-b border-slate-50">
            <p className="font-bold text-slate-600">{h.date} • {h.type}</p>
            <span className={`font-black uppercase text-[10px] ${h.status === 'Approved' ? 'text-green-500' : h.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
