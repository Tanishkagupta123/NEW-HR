import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PayrollManagement1() {
  const [form, setForm] = useState({
    employee: "", basicSalary: "", bonus: "", leaveDeduction: "", otherDeduction: "",
  });
  const [pfEnabled, setPfEnabled] = useState(false);
  
  const [employees, setEmployees] = useState([]);
  const [payrollList, setPayrollList] = useState([]);

  // --- CALCULATIONS ---
  const selectedEmployee = employees.find(emp => emp.name === form.employee);
  const basic = Number(selectedEmployee ? selectedEmployee.monthly_salary : form.basicSalary || 0);
  const bon = Number(form.bonus || 0);
  const leave = Number(form.leaveDeduction || 0);
  const other = Number(form.otherDeduction || 0);

  const grossEarnings = basic;
  
  // Logic: Agar basic 0 hai to deductions bhi 0 honge
  const pf = (pfEnabled && basic > 0) ? (basic * 0.12).toFixed(2) : 0;
  const esi = (pfEnabled && grossEarnings > 0) ? (grossEarnings * 0.0075).toFixed(2) : 0;
  const profTax = (pfEnabled && basic > 0) ? 200 : 0; 
  
  const govtDeductions = Number(pf) + Number(esi) + Number(profTax);
  const totalGrossForDisplay = (grossEarnings + bon).toFixed(2);
  
  // Net Salary: Agar basic > 0 hai tabhi calculate kare, nahi toh 0.00
  const netSalary = basic > 0 
    ? Math.max(0, (Number(totalGrossForDisplay) - govtDeductions - leave - other)).toFixed(2) 
    : "0.00";

  const fetchData = async () => {
    try {
      const empRes = await axios.get(`${API_BASE_URL}/employees`);
      const payRes = await axios.get(`${API_BASE_URL}/payroll/all`);
      const empData = Array.isArray(empRes.data) ? empRes.data : (empRes.data.data || []);
      setEmployees(empData);
      setPayrollList(Array.isArray(payRes.data) ? payRes.data : (payRes.data.data || []));
    } catch (err) { console.error("Error fetching data:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    if (e.target.name === 'employee') {
      const emp = employees.find((emp) => emp.name === value);
      // Prefill basic salary and last known deductions (attendance/other) from payroll history
      let lastPayroll = null;
      for (let i = payrollList.length - 1; i >= 0; i--) {
        if (String(payrollList[i].employee_name) === String(value)) { lastPayroll = payrollList[i]; break; }
      }
      setForm({
        ...form,
        employee: value,
        basicSalary: emp ? String(emp.monthly_salary || '') : '',
        leaveDeduction: lastPayroll ? String(lastPayroll.leave_deduction || 0) : (emp && emp.leave_deduction ? String(emp.leave_deduction) : ''),
        otherDeduction: lastPayroll ? String(lastPayroll.other_deduction || 0) : '',
      });
    } else {
      setForm({ ...form, [e.target.name]: value });
    }
  };

  const handleSave = async () => {
    if (!form.employee) return alert("Select an employee!");
    try {
      await axios.post(`${API_BASE_URL}/payroll/save`, {
        ...form, gross: totalGrossForDisplay, net: netSalary, pf: pf, esi: esi, tax: profTax,
        houseRent: 0, medical: 0, travel: 0, overtime: 0
      });
      alert("Payroll Saved Successfully!");
      setForm({ employee: "", basicSalary: "", bonus: "", leaveDeduction: "", otherDeduction: "" });
      fetchData();
    } catch (err) { alert("Error saving payroll."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/payroll/delete/${id}`);
      fetchData();
    } catch (err) { alert("Error deleting payroll."); console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-md border p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-violet-900">Payroll Management</h1>
        
        {/* --- DEDUCTION SUMMARY CARD --- */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between mt-8 bg-violet-900 p-6 rounded-3xl text-white gap-6 shadow-md border border-violet-800/60">
            <div className="flex-1 min-w-[130px]">
              <p className="text-xs text-violet-300 font-medium mb-1">Tax + PF + ESI</p>
              <h3 className="text-2xl font-bold tracking-wide">₹{govtDeductions.toFixed(2)}</h3>
            </div>
            
            <div className="w-px h-12 bg-violet-700/50 hidden md:block"></div>
            
            <div className="flex-1 min-w-[130px]">
              <p className="text-xs text-violet-300 font-medium mb-1">Leave / Attendance</p>
              <h3 className="text-2xl font-bold tracking-wide text-red-300">₹{leave}</h3>
            </div>
            
            <div className="w-px h-12 bg-violet-700/50 hidden md:block"></div>
            
            <div className="flex-1 min-w-[130px]">
              <p className="text-xs text-violet-300 font-medium mb-1">Other Deductions</p>
              <h3 className="text-2xl font-bold tracking-wide text-red-300">₹{other}</h3>
            </div>

            <div className="flex-1 min-w-[240px] flex items-center justify-between bg-violet-950/40 p-4 -my-2 rounded-2xl border border-violet-700/30 shadow-inner">
              <div>
                <p className="text-xs text-violet-300 font-medium mb-1">Final Net Salary</p>
                <h3 className="text-3xl font-black text-green-400">₹{netSalary}</h3>
              </div>
              <div className="flex flex-col items-center ml-3 pl-4 border-l border-violet-800/50">
                <p className="text-[9px] font-bold text-violet-300 mb-1.5 uppercase tracking-widest">Apply Taxes</p>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={pfEnabled} onChange={e => setPfEnabled(e.target.checked)} className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-violet-900/80 border border-violet-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-500 peer-checked:border-green-500 peer-checked:after:translate-x-full peer-focus:outline-none" />
                </label>
              </div>
            </div>
        </div>

        {/* --- INPUT FORM --- */}
        <div className="mt-8 bg-slate-50 rounded-3xl border p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-6 sm:mb-8">Salary Calculation</h2>
          <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-medium">Employee</label>
                <select name="employee" value={form.employee} onChange={handleChange} className="w-full mt-2 border rounded-xl p-3">
                  <option value="">Select Employee</option>
                  {employees.map((emp, i) => <option key={i} value={emp.name}>{emp.name}</option>)}
                </select>
              </div>
              <div><label className="font-medium">Basic Salary</label><input type="number" name="basicSalary" value={form.basicSalary} readOnly className="w-full mt-2 border rounded-xl p-3 bg-slate-100 cursor-not-allowed"/></div>

              <div><label className="font-medium">Bonus</label><input type="number" name="bonus" value={form.bonus} onChange={handleChange} className="w-full mt-2 border rounded-xl p-3"/></div>
              <div><label className="font-medium">Leave Deduction (attendance)</label><input type="number" name="leaveDeduction" value={form.leaveDeduction} readOnly className="w-full mt-2 border rounded-xl p-3 bg-slate-100 cursor-not-allowed"/></div>
              <div><label className="font-medium">Other Deduction</label><input type="number" name="otherDeduction" value={form.otherDeduction} onChange={handleChange} className="w-full mt-2 border rounded-xl p-3"/></div>
          </div>
          <div className="flex flex-wrap gap-4 mt-10">
            <button onClick={handleSave} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold">Save Payroll</button>
          </div>
        </div>

        {/* --- DETAILED HISTORY TABLE --- */}
        <div className="mt-12 bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border overflow-x-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-violet-900">Payroll History & Breakdown</h2>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="p-3">Employee</th>
                <th className="p-3">Basic</th>
                <th className="p-3">PF</th>
                <th className="p-3 text-red-500">Leaves/Other</th>
                <th className="p-3 font-bold text-slate-800">Gross</th>
                <th className="p-3 font-bold text-blue-700">Net Salary</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollList.map((p, i) => (
                <tr key={i} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-bold">{p.employee_name}</td>
                  <td className="p-3">₹{p.basic_salary}</td>
                  <td className="p-3 text-red-600">₹{p.pf || 0}</td>
                  <td className="p-3 text-red-600">₹{Number(p.leave_deduction || 0) + Number(p.other_deduction || 0)}</td>
                  <td className="p-3 font-bold">₹{p.gross_salary}</td>
                  <td className="p-3 font-bold text-blue-700">₹{p.net_salary}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(p.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
