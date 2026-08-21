import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function PayrollManagement1() {
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const [form, setForm] = useState({
    employee: "",
    basicSalary: "",
    bonus: "",
    leaveDeduction: "",
    otherDeduction: "",
    monthYear: currentMonthStr
  });
  const [pfEnabled, setPfEnabled] = useState(false);
  const [deductionBreakdown, setDeductionBreakdown] = useState({ absentDays: 0, absentAmount: 0, halfDays: 0, halfDayAmount: 0, lateFines: 0, totalFineAmount: 0 });
  const [employees, setEmployees] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchAttendanceDeduction = async () => {
      if (!form.employee || !form.monthYear) return;
      const [year, month] = form.monthYear.split('-');
      try {
        const emp = employees.find(e => e.name === form.employee);
        if (!emp) return;
        const perDaySalary = emp.monthly_salary ? (Number(emp.monthly_salary) / 30) : 0;
        
        const attRes = await axios.get(`${API_BASE_URL}/attendance/today`, { params: { year, month } });
        const attendanceData = Array.isArray(attRes.data) ? attRes.data : [];
        const empAttendance = attendanceData.filter(a => a.employee_name === form.employee);
        
        let absentDays = 0;
        let absentAmount = 0;
        let halfDays = 0;
        let halfDayAmount = 0;
        let lateFines = 0;
        let totalFineAmount = 0;
        
        let activeConfig = { onTimeLimit: '09:35', lateLimit: '11:00', earlyOutLimit: '13:00', fullDayOutLimit: '17:00', lateFineAmount: 50 };
        try {
          const confRes = await axios.get(`${API_BASE_URL}/biometric/config`);
          if (confRes.data && confRes.data.success && confRes.data.config) {
            activeConfig = { ...activeConfig, ...confRes.data.config };
          }
        } catch(e) { console.error("Config fetch failed", e); }

        const parseAttendanceTime = (value, dateString) => {
          if (!value) return null;
          if (typeof value !== 'string') { const p=new Date(value); return Number.isNaN(p.getTime())?null:p; }
          const iso = new Date(value);
          if (!Number.isNaN(iso.getTime())) return iso;
          const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
          if (!match) return null;
          const [,h,m,s='00'] = match;
          let dv = dateString||'';
          if (dv.includes('T')) dv=dv.split('T')[0];
          const base = dv ? new Date(`${dv}T00:00:00`) : new Date();
          if (Number.isNaN(base.getTime())) return null;
          base.setHours(Number(h),Number(m),Number(s),0);
          return base;
        };

        const computeDeduction = (empData, rec, machineConfig) => {
          try {
            if (!empData||!rec) return {amount:0,type:'NONE'};
            const monthly=Number(empData.monthly_salary||0);
            const perDay=monthly>0?monthly/30:0;
            const checkIn=rec.check_in||rec.checkIn||null;
            const checkOut=rec.check_out||rec.checkOut||null;
            if (!checkIn) return {amount:0,type:'NONE'};
            const inDate=parseAttendanceTime(checkIn,rec.date);
            if (!inDate) return {amount:0,type:'NONE'};
            const inMin=inDate.getHours()*60+inDate.getMinutes();

            const toMinFromStr = (str, def) => {
              const [h, m] = (str || def).split(':').map(Number);
              return h * 60 + m;
            };

            const ON_TIME   = toMinFromStr(machineConfig.onTimeLimit, '09:35');
            const VERY_LATE = toMinFromStr(machineConfig.lateLimit, '11:00');
            const EARLY_OUT = toMinFromStr(machineConfig.earlyOutLimit, '13:00');
            const FULL_OUT  = toMinFromStr(machineConfig.fullDayOutLimit, '17:00');
            const LATE_FINE = Number(machineConfig.lateFineAmount ?? 50);

            const isLate=inMin>ON_TIME&&inMin<=VERY_LATE, isVeryLate=inMin>VERY_LATE;
            if (!checkOut) {
              if(isVeryLate)return{amount:+(perDay/2).toFixed(2),type:'HALF_DAY'};
              if(isLate)return{amount:LATE_FINE,type:'LATE'};
              return{amount:0,type:'NONE'};
            }
            const outDate=parseAttendanceTime(checkOut,rec.date);
            if (!outDate) return {amount:0,type:'NONE'};
            const outMin=outDate.getHours()*60+outDate.getMinutes();
            if(isVeryLate)return{amount:+(perDay/2).toFixed(2),type:'HALF_DAY'};
            if(outMin<EARLY_OUT){
              if(isLate)return{amount:+(perDay/2).toFixed(2),type:'HALF_DAY'};
              return{amount:+perDay.toFixed(2),type:'FULL_CUT'};
            }
            if(outMin>=FULL_OUT){
              if(isLate)return{amount:LATE_FINE,type:'LATE'};
              return{amount:0,type:'NONE'};
            }
            return{amount:+(perDay/2).toFixed(2),type:'HALF_DAY'};
          } catch { return {amount:0,type:'NONE'}; }
        };

        empAttendance.forEach(a => {
          let s = (a.status || a.attendance_status || '').toUpperCase();
          let fineAmount = 0;
          
          const ded = computeDeduction(emp, a, activeConfig);
          if (ded.type !== 'NONE') {
            s = ded.type;
            fineAmount = ded.amount;
          } else {
             fineAmount = Number(a.late_fine) || 0;
          }
          
          if (s === 'ABSENT' || s === 'FULL_CUT') {
            absentDays++;
            absentAmount += fineAmount > 0 ? fineAmount : perDaySalary;
          } else if (s === 'HALF_DAY') {
            halfDays++;
            halfDayAmount += fineAmount > 0 ? fineAmount : (perDaySalary / 2);
          } else if (s === 'LATE') {
            lateFines++;
            totalFineAmount += fineAmount > 0 ? fineAmount : Number(activeConfig.lateFineAmount ?? 50);
          }
        });
        
        const totalLeaveDeduction = Math.round(absentAmount + halfDayAmount + totalFineAmount);
        
        setDeductionBreakdown({
          absentDays, absentAmount: Math.round(absentAmount),
          halfDays, halfDayAmount: Math.round(halfDayAmount),
          lateFines, totalFineAmount: Math.round(totalFineAmount)
        });
        
        setForm(prev => ({ ...prev, leaveDeduction: String(totalLeaveDeduction) }));
      } catch (err) { console.error("Error calculating deduction:", err); }
    };
    
    fetchAttendanceDeduction();
  }, [form.employee, form.monthYear, employees]);

  const selectedEmployee = employees.find(emp => emp.name === form.employee);
  const basic = Number(selectedEmployee ? selectedEmployee.monthly_salary : form.basicSalary || 0);
  const bon = Number(form.bonus || 0);
  const leave = Number(form.leaveDeduction || 0);
  const other = Number(form.otherDeduction || 0);

  const grossEarnings = basic + bon;
  const totalGrossForDisplay = basic > 0 ? grossEarnings.toFixed(2) : "0.00";

  let pf = 0, esi = 0, profTax = 0;
  if (pfEnabled && basic > 0) {
    pf = Number((basic * 0.12).toFixed(2));
  }
  const govtDeductions = pf + esi + profTax;
  
  const netSalary = basic > 0 ? Math.max(0, (Number(totalGrossForDisplay) - govtDeductions - leave - other)).toFixed(2) : "0.00";

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
      let lastPayroll = null;
      for (let i = payrollList.length - 1; i >= 0; i--) {
        if (String(payrollList[i].employee_name) === String(value)) { lastPayroll = payrollList[i]; break; }
      }
      setForm({
        ...form,
        employee: value,
        basicSalary: emp ? String(emp.monthly_salary || '') : '',
        otherDeduction: lastPayroll ? String(lastPayroll.other_deduction || 0) : '',
      });
    } else {
      setForm({ ...form, [e.target.name]: value });
    }
  };

  const handleSave = async () => {
    if (!form.employee || !form.monthYear) return alert("Select an employee and a Salary Month!");
    try {
      await axios.post(`${API_BASE_URL}/payroll/save`, {
        ...form, gross: totalGrossForDisplay, net: netSalary, pf: pf, esi: esi, tax: profTax,
        houseRent: 0, medical: 0, travel: 0, overtime: 0, month_year: form.monthYear,
        absent_days: deductionBreakdown.absentDays,
        half_days: deductionBreakdown.halfDays,
        late_fines: deductionBreakdown.lateFines
      });
      alert("Payroll Saved Successfully!");
      setForm({ employee: "", basicSalary: "", bonus: "", leaveDeduction: "", otherDeduction: "", monthYear: currentMonthStr });
      setDeductionBreakdown({ absentDays: 0, absentAmount: 0, halfDays: 0, halfDayAmount: 0, lateFines: 0, totalFineAmount: 0 });
      fetchData();
    } catch (err) { alert("Error saving payroll."); }
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formatMonth = (val) => {
    if (!val || typeof val !== 'string') return val;
    const parts = val.split('-');
    if (parts.length === 2) {
      const mIndex = Number(parts[1]) - 1;
      if (mIndex >= 0 && mIndex < 12) return `${months[mIndex]} ${parts[0]}`;
    }
    return val;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-md border p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-violet-900">Payroll Management</h1>
        
        {/* --- DEDUCTION SUMMARY CARD --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-8 bg-violet-900 p-5 rounded-3xl text-white gap-6 shadow-md border border-violet-800/60">
            <div className="flex flex-col gap-4 w-full md:flex-row md:items-center md:flex-1 md:justify-around">
                <div>
                  <p className="text-xs text-violet-300 font-medium mb-1">PF Deduction</p>
                  <h3 className="text-2xl font-bold tracking-wide">₹{govtDeductions.toFixed(2)}</h3>
                </div>
                
                <div className="w-px h-12 bg-violet-700/50 hidden md:block"></div>
                
                <div>
                  <p className="text-xs text-violet-300 font-medium mb-1">Leave / Attendance</p>
                  <h3 className="text-2xl font-bold tracking-wide text-red-300">₹{leave}</h3>
                </div>
                
                <div className="w-px h-12 bg-violet-700/50 hidden md:block"></div>
                
                <div>
                  <p className="text-xs text-violet-300 font-medium mb-1">Other Deductions</p>
                  <h3 className="text-2xl font-bold tracking-wide text-red-300">₹{other}</h3>
                </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-between bg-violet-950/40 p-4 rounded-2xl border border-violet-700/30 shadow-inner">
              <div className="mb-3 sm:mb-0">
                <p className="text-xs text-violet-300 font-medium mb-1 text-center sm:text-left">Final Net Salary</p>
                <h3 className="text-3xl font-black text-green-400">₹{netSalary}</h3>
              </div>
              <div className="flex flex-col items-center sm:ml-6 sm:pl-6 border-t sm:border-t-0 sm:border-l border-violet-800/50 pt-3 sm:pt-0">
                <p className="text-[9px] font-bold text-violet-300 mb-1.5 uppercase tracking-widest">Apply PF</p>
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
              <div><label className="font-medium">Salary Month</label><input type="month" name="monthYear" value={form.monthYear} onChange={handleChange} className="w-full mt-2 border rounded-xl p-3"/></div>
          </div>
          
          {form.employee && form.monthYear && (
            <div className="mt-6 p-5 bg-red-50 border border-red-100 rounded-2xl">
              <h3 className="text-sm font-semibold text-red-800 mb-3 uppercase tracking-wider">Attendance Deduction Breakdown (Auto-calculated)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-red-900">
                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                  <span className="block font-medium text-slate-500 text-xs mb-1">Absents ({deductionBreakdown.absentDays} days)</span>
                  <span className="font-bold text-lg">₹{deductionBreakdown.absentAmount}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                  <span className="block font-medium text-slate-500 text-xs mb-1">Half Days ({deductionBreakdown.halfDays} days)</span>
                  <span className="font-bold text-lg">₹{deductionBreakdown.halfDayAmount}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                  <span className="block font-medium text-slate-500 text-xs mb-1">Late Fines ({deductionBreakdown.lateFines} times)</span>
                  <span className="font-bold text-lg">₹{deductionBreakdown.totalFineAmount}</span>
                </div>
              </div>
            </div>
          )}

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
                <th className="p-3">Month</th>
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
                  <td className="p-3 font-semibold text-slate-600">{formatMonth(p.month_year)}</td>
                  <td className="p-3">₹{p.basic_salary}</td>
                  <td className="p-3 text-red-600">₹{p.pf || 0}</td>
                  <td className="p-3 text-red-600">₹{Number(p.leave_deduction || 0) + Number(p.other_deduction || 0)}</td>
                  <td className="p-3 font-bold">₹{p.gross_salary}</td>
                  <td className="p-3 font-bold text-blue-700">₹{p.net_salary}</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => setSelectedRecord(p)} 
                      className="bg-violet-50 text-violet-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-violet-100 transition-colors border border-violet-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedRecord(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 p-1 rounded-full"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-violet-900">Salary Details</h2>
              <p className="text-slate-500 text-sm mt-1">{formatMonth(selectedRecord.month_year)} - {selectedRecord.employee_name}</p>
            </div>
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Basic Salary:</span> <b>₹{selectedRecord.basic_salary || 0}</b></div>
                {Number(selectedRecord.bonus) > 0 && <div className="flex justify-between"><span>Bonus:</span> <b>₹{selectedRecord.bonus}</b></div>}
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-red-600">
                {Number(selectedRecord.pf) > 0 && <div className="flex justify-between"><span>PF Deduction:</span> <b>-₹{selectedRecord.pf}</b></div>}
                {Number(selectedRecord.leave_deduction) > 0 && <div className="flex justify-between"><span>Leave Deductions:</span> <b>-₹{selectedRecord.leave_deduction}</b></div>}
                {Number(selectedRecord.other_deduction) > 0 && <div className="flex justify-between"><span>Other Deductions:</span> <b>-₹{selectedRecord.other_deduction}</b></div>}
              </div>
              <div className="border-t border-slate-300 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-800">Gross Salary:</span>
                <span className="font-bold text-slate-800">₹{selectedRecord.gross_salary}</span>
              </div>
              <div className="flex justify-between items-center text-lg mt-2">
                <span className="font-extrabold text-violet-900">Net Salary:</span>
                <span className="font-extrabold text-violet-600">₹{selectedRecord.net_salary}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
