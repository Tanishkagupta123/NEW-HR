import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

export default function Attendance() {
  const context = useOutletContext() || {};
  const [localEmployees, setLocalEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const employeesList = (context.employeesList && context.employeesList.length > 0) ? context.employeesList : localEmployees;

  useEffect(() => {
    if (!context.employeesList || context.employeesList.length === 0) {
      axios.get(`${API_BASE_URL}/employees`)
        .then(res => { if (Array.isArray(res.data)) setLocalEmployees(res.data); })
        .catch(err => console.error("Error fetching employees in Attendance:", err));
    }
    axios.get(`${API_BASE_URL}/holidays`)
      .then(res => setHolidays(res.data || []))
      .catch(err => console.error(err));
  }, [context.employeesList]);

  const [allRecords, setAllRecords]           = useState([]);
  const [loadingMap, setLoadingMap]           = useState({});
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedMonth, setSelectedMonth]     = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear]       = useState(new Date().getFullYear());
  
  // Default to today's date instead of null
  const [filterDate, setFilterDate]           = useState(new Date().toISOString().slice(0, 10));
  
  const [dayFilter, setDayFilter]             = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [clockNow, setClockNow]               = useState(new Date());
  const [overrideModal, setOverrideModal]     = useState(null);
  const [overrideForm, setOverrideForm]       = useState({ check_in: '', check_out: '', date: '' });
  const [overrideSaving, setOverrideSaving]   = useState(false);
  const [overrideMsg, setOverrideMsg]         = useState('');

  // ── Machine Settings state (admin only) ──
  const [showMachineSettings, setShowMachineSettings] = useState(false);
  const [machineConfig, setMachineConfig] = useState({ enabled: false, brand: 'ZKTeco', ip: '', port: 4370, syncIntervalMinutes: 5 });
  const [machineMsg, setMachineMsg]   = useState('');
  const [machineBusy, setMachineBusy] = useState(false);

  // Admin check — only admin can see edit/machine options
  const isAdmin = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      if (!u) return true;
      const role = (u.role || u.position || '').toString().toLowerCase();
      return role === 'admin' || role === 'superadmin' || u.isAdmin === true;
    } catch { return false; }
  })();

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const formatLocalDate = (ds) => {
    if (!ds) return '';
    const d = new Date(ds);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

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

  const calculateWorkHours = (inT, outT, ds) => {
    const s=parseAttendanceTime(inT,ds), e=parseAttendanceTime(outT,ds);
    if (!s||!e) return '--';
    let mins=Math.round((e-s)/60000); if(mins<0)mins=Math.abs(mins);
    return `${Math.floor(mins/60)}h ${mins%60}m`;
  };

  const getDayName = (ds) => {
    if (!ds) return '--';
    const d=new Date(ds); if(Number.isNaN(d.getTime()))return '--';
    return d.toLocaleDateString('en-GB',{weekday:'short'});
  };

  const computeDeduction = (emp, rec) => {
    try {
      if (!emp||!rec) return {amount:0,type:'NONE'};
      const monthly=Number(emp.monthly_salary||emp.monthlySalary||0);
      const perDay=monthly>0?monthly/30:0;
      const checkIn=rec.checkIn||rec.check_in||null;
      const checkOut=rec.checkOut||rec.check_out||null;
      if (!checkIn) return {amount:0,type:'NONE'};
      const inDate=parseAttendanceTime(checkIn,rec.date);
      if (!inDate) return {amount:0,type:'NONE'};
      const inMin=inDate.getHours()*60+inDate.getMinutes();

      // Read timings dynamically configured by Admin
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

  const normalizeItem = (item) => {
    if (!item) return null;
    const checkIn=item.check_in||item.checkIn||null;
    const checkOut=item.check_out||item.checkOut||null;
    const empId=item.employee_id||item.empId||item.student_id||item.id;
    return {...item,employeeId:empId,checkIn,checkOut};
  };

  const fetchAttendanceData = async (month) => {
    try {
      const res=await axios.get(`${API_BASE_URL}/attendance/today`,{params:{year:selectedYear,month:month+1}});
      const list=Array.isArray(res.data)?res.data.map(normalizeItem).filter(Boolean):[];
      setAllRecords(list);
    } catch(err){console.error('Attendance fetch error',err);}
  };

  // Load machine config on mount (admin only)
  useEffect(()=>{
    if (!isAdmin) return;
    axios.get(`${API_BASE_URL}/biometric/config`).then(r=>{
      if(r.data.success) setMachineConfig(r.data.config);
    }).catch(()=>{});
  },[]);

  const saveMachineConfig = async () => {
    setMachineBusy(true); setMachineMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/biometric/config`, machineConfig);
      setMachineMsg(res.data.success ? '✅ Saved! Auto-sync will start.' : '❌ ' + res.data.message);
    } catch(e){ setMachineMsg('❌ ' + e.message); }
    setMachineBusy(false);
  };

  const testMachineConnection = async () => {
    setMachineBusy(true); setMachineMsg('Testing...');
    try {
      const res = await axios.post(`${API_BASE_URL}/biometric/test-connection`);
      setMachineMsg(res.data.success ? '✅ Connected! ' + JSON.stringify(res.data.deviceInfo||{}) : '❌ ' + res.data.message);
    } catch(e){ setMachineMsg('❌ ' + (e.response?.data?.message || e.message)); }
    setMachineBusy(false);
  };

  const syncMachineNow = async () => {
    setMachineBusy(true); setMachineMsg('Syncing...');
    try {
      const res = await axios.post(`${API_BASE_URL}/biometric/sync`);
      setMachineMsg(res.data.success ? `✅ ${res.data.message}` : '❌ ' + res.data.message);
      fetchAttendanceData(selectedMonth);
    } catch(e){ setMachineMsg('❌ ' + (e.response?.data?.message || e.message)); }
    setMachineBusy(false);
  };

  useEffect(() => {
    fetchAttendanceData(selectedMonth);
    const iv = setInterval(() => fetchAttendanceData(selectedMonth), 5000);
    return () => clearInterval(iv);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const t = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getEmployeeRecord = (emp) => {
    const id = String(emp.id || '');
    const code = String(emp.employee_code || '');
    const recs = allRecords.filter(r => 
      String(r.employeeId || r.employee_id || '') === id ||
      (r.emp_id && (String(r.emp_id) === id || String(r.emp_id) === code)) ||
      (r.employee_name && emp.name && r.employee_name.trim().toLowerCase() === emp.name.trim().toLowerCase())
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filterDate) return recs.find(r => formatLocalDate(r.date) === filterDate) || {};
    return recs[0] || {};
  };

  const isSunday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getDay() === 0;
  };

  const isFutureDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr > todayStr;
  };

  const isHoliday = (dateStr) => {
    if (!dateStr) return false;
    return holidays.some(h => h.full_date === dateStr);
  };

  const getAttendanceLabel = (rec) => {
    if (!rec||(!rec.checkIn&&!rec.check_in&&!rec.checkOut&&!rec.check_out&&!rec.status&&!rec.attendance_status)) {
      if (filterDate) {
        if (isFutureDate(filterDate)) return 'UPCOMING';
        if (isSunday(filterDate)) return 'SUNDAY';
        return isHoliday(filterDate) ? 'HOLIDAY' : 'ABSENT';
      }
      return '--';
    }
    const s=(rec.status||rec.attendance_status||'').toString().trim().toUpperCase();
    if(['COMPLETED','IN','OUT','PRESENT'].includes(s))return'PRESENT';
    if(['HALF_DAY','LATE','ABSENT','FULL_CUT'].includes(s))return s;
    if(rec.checkIn||rec.check_in)return'PRESENT';
    
    if (filterDate) {
      if (isFutureDate(filterDate)) return 'UPCOMING';
      if (isSunday(filterDate)) return 'SUNDAY';
      return isHoliday(filterDate) ? 'HOLIDAY' : 'ABSENT';
    }
    return '--';
  };

  const openOverride = (emp, rec) => {
    const t = new Date();
    const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const targetDate = formatLocalDate(rec.date) || (filterDate || todayStr);
    
    if (isFutureDate(targetDate)) {
      alert("You cannot edit attendance for future dates!");
      return;
    }

    setOverrideForm({
      check_in:rec.checkIn||rec.check_in||'',
      check_out:rec.checkOut||rec.check_out||'',
      date:targetDate,
      status_override:'AUTO'
    });
    setOverrideModal({emp,rec});
    setOverrideMsg('');
  };

  const handleOverrideSave = async () => {
    if(!overrideModal)return;
    setOverrideSaving(true); setOverrideMsg('');
    try {
      const res=await axios.post(`${API_BASE_URL}/attendance/admin-override`,{
        employee_id:overrideModal.emp.id,
        date:overrideForm.date,
        check_in:overrideForm.check_in||null,
        check_out:overrideForm.check_out||null,
        status_override:overrideForm.status_override||'AUTO'
      });
      if(res.data.success){
        setOverrideMsg('Saved!');
        fetchAttendanceData(selectedMonth);
        setTimeout(()=>setOverrideModal(null),800);
      } else { setOverrideMsg(res.data.message||'Failed'); }
    } catch(err){ setOverrideMsg(err.response?.data?.message||err.message); }
    finally { setOverrideSaving(false); }
  };

  const initials=(name='')=>name.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()).join('')||'?';

  const statusFlag=(s)=>{
    if(s==='LATE')return'border-l-amber-400';
    if(s==='HALF_DAY')return'border-l-rose-400';
    if(s==='FULL_CUT'||s==='ABSENT')return'border-l-red-500';
    if(['PRESENT','COMPLETED','IN','OUT'].includes(s))return'border-l-emerald-400';
    if(s==='HOLIDAY')return'border-l-indigo-400';
    if(s==='SUNDAY')return'border-l-sky-400';
    if(s==='UPCOMING')return'border-l-slate-300';
    return'border-l-slate-200';
  };

  const statusPill=(s)=>{
    const map={LATE:'bg-amber-50 text-amber-700 ring-1 ring-amber-200',HALF_DAY:'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
      FULL_CUT:'bg-red-100 text-red-700 ring-1 ring-red-300',ABSENT:'bg-red-50 text-red-700 ring-1 ring-red-200',
      PRESENT:'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',COMPLETED:'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      IN:'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',OUT:'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      HOLIDAY:'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300',
      SUNDAY:'bg-sky-50 text-sky-700 ring-1 ring-sky-300',
      UPCOMING:'bg-slate-100 text-slate-500 ring-1 ring-slate-300'};
    return map[s]||'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
  };

  // Merge registered employees with any biometric punch records from machine
  const allDisplayEmployees = React.useMemo(() => {
    const map = new Map();
    (employeesList || []).forEach(e => {
      if (e && e.id) map.set(String(e.id), { ...e });
    });
    
    (allRecords || []).forEach(r => {
      const eid = String(r.employeeId || r.employee_id || r.emp_id || '');
      if (eid && !map.has(eid)) {
        map.set(eid, {
          id: eid,
          name: r.employee_name || `Employee ${eid}`,
          employee_code: r.emp_id || `EMP-${eid}`,
          monthly_salary: 0,
          isBiometricAuto: true
        });
      }
    });
    return Array.from(map.values());
  }, [employeesList, allRecords]);

  const selectedEmp = React.useMemo(() => {
    if (!selectedEmployeeId) return null;
    return allDisplayEmployees.find(e => String(e.id) === String(selectedEmployeeId)) || null;
  }, [selectedEmployeeId, allDisplayEmployees]);

  const singleEmpRecords = React.useMemo(() => {
    if (!selectedEmp) return [];
    const id = String(selectedEmp.id || '');
    const code = String(selectedEmp.employee_code || '');
    const name = (selectedEmp.name || '').trim().toLowerCase();

    return (allRecords || []).filter(r => {
      const rId = String(r.employeeId || r.employee_id || '');
      const rEmpId = String(r.emp_id || '');
      const rName = (r.employee_name || '').trim().toLowerCase();
      return rId === id || (code && rEmpId === code) || rEmpId === id || (name && rName && rName === name);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedEmp, allRecords]);

  const displayedSingleRecords = React.useMemo(() => {
    if (!filterDate) return singleEmpRecords;
    return singleEmpRecords.filter(r => formatLocalDate(r.date) === filterDate);
  }, [singleEmpRecords, filterDate]);

  // Single Employee summary calculations
  const singleSummary = React.useMemo(() => {
    if (!selectedEmp) return null;
    return singleEmpRecords.reduce((acc, rec) => {
      const st = (rec.status || rec.attendance_status || '').toString().toUpperCase();
      const ded = computeDeduction(selectedEmp, rec);
      acc.totalDays++;
      acc.totalFines += (ded.amount || 0);
      if (st === 'LATE') acc.late++;
      else if (st === 'HALF_DAY') acc.halfDay++;
      else if (['COMPLETED', 'IN', 'OUT', 'PRESENT'].includes(st)) acc.onTime++;
      return acc;
    }, { totalDays: 0, onTime: 0, late: 0, halfDay: 0, totalFines: 0 });
  }, [selectedEmp, singleEmpRecords]);

  const filteredEmployees = allDisplayEmployees
    .filter(e => (e.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase()) || (e.employee_code || '').toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .filter(e => !selectedEmployeeId || String(e.id) === String(selectedEmployeeId));

    const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (selectedEmployeeId && selectedEmp) {
      csvContent += "Date,Day,Status,Check-In,Check-Out,Work Hours,Penalty/Fine\n";
      displayedSingleRecords.forEach(rec => {
        const d = formatLocalDate(rec.date);
        const day = getDayName(rec.date);
        const status = getAttendanceLabel(rec);
        const st = (rec.status || rec.attendance_status || status).replace('_', ' ').toUpperCase();
        const ci = rec.checkIn || rec.check_in || '--';
        const co = rec.checkOut || rec.check_out || '--';
        const wh = (ci !== '--' && co !== '--' && ci && co) ? calculateWorkHours(ci, co, rec.date) : '--';
        const ded = computeDeduction(selectedEmp, rec);
        const penalty = ded.amount > 0 ? "Rs. " + ded.amount : 'None';
        
        csvContent += `"${d}","${day}","${st}","${ci}","${co}","${wh}","${penalty}"\n`;
      });
    } else {
      csvContent += "Emp Code,Name,Department,Status,Check-In,Check-Out,Work Hours,Penalty/Fine\n";
      filteredEmployees.forEach(emp => {
        const rec = getEmployeeRecord(emp);
        const code = emp.employee_code || "EMP-" + emp.id;
        const name = emp.name || '--';
        const dept = emp.department || '--';
        const status = getAttendanceLabel(rec);
        const st = (rec.status || rec.attendance_status || status).replace('_', ' ').toUpperCase();
        const ci = rec.checkIn || rec.check_in || '--';
        const co = rec.checkOut || rec.check_out || '--';
        const wh = (ci !== '--' && co !== '--' && ci && co) ? calculateWorkHours(ci, co, filterDate) : '--';
        const ded = computeDeduction(emp, rec);
        const penalty = ded.amount > 0 ? "Rs. " + ded.amount : 'None';
        
        csvContent += `"${code}","${name}","${dept}","${st}","${ci}","${co}","${wh}","${penalty}"\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = selectedEmp 
      ? "Attendance_" + selectedEmp.name.replace(/\s+/g, '_') + "_" + monthNames[selectedMonth] + "_" + selectedYear + ".csv"
      : "Attendance_All_" + filterDate + ".csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = filteredEmployees.reduce((s, emp) => {
    const rec = getEmployeeRecord(emp);
    const st = (rec.status || rec.attendance_status || '').toString().toUpperCase();
    s.total++;
    if (st === 'LATE') s.late++;
    else if (st === 'HALF_DAY') s.halfDay++;
    else if (['FULL_CUT', 'ABSENT'].includes(st) || (!rec.date && filterDate && !isHoliday(filterDate) && !isSunday(filterDate) && !isFutureDate(filterDate))) s.absent++;
    else if (['COMPLETED', 'IN', 'OUT', 'PRESENT'].includes(st)) s.onTime++;
    return s;
  }, { total: 0, onTime: 0, late: 0, halfDay: 0, absent: 0 });

  const clockDigits = clockNow.toLocaleTimeString('en-GB', { hour12: false });

  return (
    <div className="min-h-screen bg-[#F6F5FB] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">HR · Attendance Ledger</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-800">
              {selectedEmp ? `${selectedEmp.name}'s Attendance` : 'Attendance Management'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {selectedEmp
                ? `Showing complete month punch history for ${selectedEmp.name} (${selectedEmp.employee_code || `EMP-${selectedEmp.id}`})`
                : 'Every check-in, check-out, fine and biometric punch entered against the day it happened.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Export CSV
              </button>
            {isAdmin && (
              <button
                onClick={() => setShowMachineSettings(v => !v)}
                className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-violet-600 transition active:scale-95 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Rules & Machine Settings
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200 whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"/>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"/>
              </span>
              Live · {clockDigits}
            </span>
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-2xs whitespace-nowrap">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
          </div>
        </div>

        {/* ── Admin Master Timing Rules & Machine Settings Modal Popup ── */}
        {isAdmin && showMachineSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-inner">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Attendance Timing & Machine Settings</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Office rules, late fines & biometric hardware configuration</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMachineSettings(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </div>

              {/* Section 1: Office Timing & Fine Rules */}
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Section 1 · Office Timing & Fine Rules</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">On-Time Arrival (Limit)</label>
                    <input
                      type="time"
                      value={machineConfig.onTimeLimit || '09:35'}
                      onChange={e => setMachineConfig(c => ({ ...c, onTimeLimit: e.target.value }))}
                      className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-violet-500"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ Before this = No fine</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Late Boundary (Time)</label>
                    <input
                      type="time"
                      value={machineConfig.lateLimit || '11:00'}
                      onChange={e => setMachineConfig(c => ({ ...c, lateLimit: e.target.value }))}
                      className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-violet-500"
                    />
                    <span className="text-[10px] text-amber-600 font-semibold mt-1 block">⚠️ Late fine applies till this time</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Late Fine Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={machineConfig.lateFineAmount ?? 50}
                        onChange={e => setMachineConfig(c => ({ ...c, lateFineAmount: Number(e.target.value) }))}
                        className="w-full rounded-lg bg-white border border-slate-200 pl-7 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-violet-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹50 / day late</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Early Exit Threshold</label>
                    <input
                      type="time"
                      value={machineConfig.earlyOutLimit || '13:00'}
                      onChange={e => setMachineConfig(c => ({ ...c, earlyOutLimit: e.target.value }))}
                      className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-violet-500"
                    />
                    <span className="text-[10px] text-rose-500 font-semibold mt-1 block">✕ Exit before this = Full Cut</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Day Checkout</label>
                    <input
                      type="time"
                      value={machineConfig.fullDayOutLimit || '17:00'}
                      onChange={e => setMachineConfig(c => ({ ...c, fullDayOutLimit: e.target.value }))}
                      className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-violet-500"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ Full Day marked on/after this</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Biometric Hardware Setup */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Section 2 · Biometric Machine</p>
                    <p className="text-xs text-slate-500 mt-0.5">Connect to ZKTeco / eSSL / Identix hardware</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={machineConfig.enabled}
                      onChange={e => setMachineConfig(c => ({ ...c, enabled: e.target.checked }))}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
                    <span className="ml-2 text-xs font-bold text-slate-700">{machineConfig.enabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Brand</label>
                    <select
                      value={machineConfig.brand || 'Identix'}
                      onChange={e => setMachineConfig(c => ({ ...c, brand: e.target.value }))}
                      className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    >
                      <option>Identix</option>
                      <option>ZKTeco</option>
                      <option>eSSL</option>
                      <option>Mantra</option>
                      <option>Realtime</option>
                    </select>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">IP Address</label>
                    <input
                      value={machineConfig.ip}
                      onChange={e => setMachineConfig(c => ({ ...c, ip: e.target.value }))}
                      placeholder="e.g. 192.168.1.201"
                      className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Port</label>
                    <input
                      type="number"
                      value={machineConfig.port}
                      onChange={e => setMachineConfig(c => ({ ...c, port: Number(e.target.value) }))}
                      className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Sync (Mins)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={machineConfig.syncIntervalMinutes}
                      onChange={e => setMachineConfig(c => ({ ...c, syncIntervalMinutes: Number(e.target.value) }))}
                      className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {machineMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${machineMsg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  <span>{machineMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {machineConfig.enabled && machineConfig.ip && (
                    <>
                      <button
                        onClick={testMachineConnection}
                        disabled={machineBusy}
                        className="rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition disabled:opacity-50"
                      >
                        ⚡ Test Connection
                      </button>
                      <button
                        onClick={syncMachineNow}
                        disabled={machineBusy}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
                      >
                        🔄 Sync Machine Now
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMachineSettings(false)}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMachineConfig}
                    disabled={machineBusy}
                    className="rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow transition disabled:opacity-50"
                  >
                    {machineBusy ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY KPI CARDS */}
        {selectedEmp ? (
          <div className="mb-6 rounded-2xl border border-violet-200/80 border-l-4 border-l-violet-600 bg-gradient-to-r from-violet-50/50 via-white to-indigo-50/30 p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                {selectedEmp.profile_pic ? (
                  <img
                    src={selectedEmp.profile_pic.startsWith('http') ? selectedEmp.profile_pic : `${API_BASE_URL}/${selectedEmp.profile_pic.replace(/^\/+/, '')}`}
                    alt={selectedEmp.name}
                    className="h-12 w-12 rounded-xl object-cover border border-violet-200 shadow-2xs"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white font-bold text-base shadow-xs">
                    {initials(selectedEmp.name)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedEmp.name}</h2>
                    <span className="rounded-md bg-violet-100/80 text-violet-700 border border-violet-200 px-2 py-0.5 font-mono text-xs font-bold">
                      {selectedEmp.employee_code || `EMP-${selectedEmp.id}`}
                    </span>
                    {selectedEmp.department && (
                      <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">
                        {selectedEmp.department}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedEmp.designation || 'Staff Member'} · Individual Attendance Ledger
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedEmployeeId(''); setSearchTerm(''); }}
                className="self-start sm:self-auto rounded-xl border border-violet-200 bg-white hover:bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 transition shadow-2xs"
              >
                ← View All Employees
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-violet-100">
              <div className="rounded-xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Days Recorded</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{singleSummary?.totalDays || 0}</p>
              </div>
              <div className="rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200/60 shadow-2xs">
                <p className="text-[11px] font-bold text-emerald-700 uppercase">On Time</p>
                <p className="mt-1 text-xl font-bold text-emerald-700">{singleSummary?.onTime || 0}</p>
              </div>
              <div className="rounded-xl bg-amber-50/80 p-3.5 border border-amber-200/60 shadow-2xs">
                <p className="text-[11px] font-bold text-amber-700 uppercase">Late Arrivals</p>
                <p className="mt-1 text-xl font-bold text-amber-700">{singleSummary?.late || 0}</p>
              </div>
              <div className="rounded-xl bg-rose-50/80 p-3.5 border border-rose-200/60 shadow-2xs">
                <p className="text-[11px] font-bold text-rose-700 uppercase">Total Fines</p>
                <p className="mt-1 text-xl font-bold text-rose-700">₹{(singleSummary?.totalFines || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[{label:'Total',value:summary.total,accent:'text-slate-800'},{label:'On time',value:summary.onTime,accent:'text-emerald-600'},{label:'Late',value:summary.late,accent:'text-amber-600'},{label:'Half-day',value:summary.halfDay,accent:'text-rose-600'},{label:'Absent/Cut',value:summary.absent,accent:'text-red-600'}].map(s=>(
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">{s.label}</p>
                <p className={`mt-2 text-2xl font-bold ${s.accent}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── FILTER & CALENDAR BAR ── */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Search Employee</label>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Type name or code…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Select Employee (Single View)</label>
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
              >
                <option value="">All Employees (Overview)</option>
                {allDisplayEmployees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} {e.employee_code ? `(${e.employee_code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Month Filter (Full Month View)</label>
              <input
                type="month"
                value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
                onChange={e => {
                  const val = e.target.value;
                  if (val) {
                    const [y, m] = val.split('-');
                    setSelectedYear(Number(y));
                    setSelectedMonth(Number(m) - 1);
                    setFilterDate(null);
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Calendar Date Filter</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={filterDate || ''}
                  onChange={e => {
                    const val = e.target.value || null;
                    setFilterDate(val);
                    if (val) {
                      const d = new Date(val);
                      if (!Number.isNaN(d.getTime())) {
                        setSelectedMonth(d.getMonth());
                        setSelectedYear(d.getFullYear());
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    setFilterDate(todayStr);
                    setSelectedMonth(new Date().getMonth());
                    setSelectedYear(new Date().getFullYear());
                  }}
                  className="shrink-0 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                  title="Filter to today"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {(searchTerm || filterDate || selectedEmployeeId) && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400 font-medium">
                Active filter: {selectedEmp ? `Viewing ${selectedEmp.name}` : ''} {filterDate ? `· Date: ${filterDate}` : '· Full Month'}
              </p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setFilterDate(null); setSelectedEmployeeId(''); }}
                className="text-xs font-bold text-violet-600 hover:text-violet-800"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* ── ATTENDANCE DATA TABLE ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto block">
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="w-10 px-4 py-3">No.</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Salary/Day</th>
                  <th className="px-4 py-3">Fine / Cut</th>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">In</th>
                  <th className="px-4 py-3">Out</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">⚙</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* ── 1. SINGLE EMPLOYEE SELECTED: DISPLAY FULL MONTH ROWS ── */}
                {selectedEmp ? (
                  displayedSingleRecords.map((rec, idx) => {
                    const ci = rec.checkIn || rec.check_in || '';
                    const co = rec.checkOut || rec.check_out || '';
                    const hours = ci && co ? calculateWorkHours(ci, co, rec.date) : '--';
                    const status = getAttendanceLabel(rec);
                    const ded = computeDeduction(selectedEmp, rec);
                    return (
                      <tr
                        key={rec.id || idx}
                        className={`border-l-4 bg-white ${statusFlag(rec.status || rec.attendance_status || status)} transition-colors even:bg-slate-50/50 hover:bg-violet-50/30`}
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-400">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-semibold text-white">
                              {initials(selectedEmp.name)}
                            </div>
                            <div>
                              <span className="whitespace-nowrap font-medium text-slate-800 block">{selectedEmp.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">{selectedEmp.employee_code || `EMP-${selectedEmp.id}`}</span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">
                          {selectedEmp.monthly_salary ? `Rs.${(Number(selectedEmp.monthly_salary) / 30).toFixed(0)}/day` : '--'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {ded.amount === 0 ? (
                            <span className="text-xs font-medium text-emerald-600">No fine</span>
                          ) : (
                            <span className="font-mono text-xs font-semibold text-rose-600">
                              -Rs.{ded.amount} <span className="font-normal text-rose-400 text-[10px]">({ded.type.replace('_', ' ')})</span>
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{getDayName(rec.date)}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{formatLocalDate(rec.date) || '--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{ci || '--:--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{co || '--:--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-indigo-700">{hours}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            (rec.mode === 'Biometric' || rec.mode === 'biometric') ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' :
                            rec.mode === 'Admin' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                            {(rec.mode === 'Biometric' || rec.mode === 'biometric') ? '⚡ Biometric' : rec.mode || '--'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(status)}`}>
                            {status === '--' ? 'Not marked' : status.replace('_', ' ')}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <button
                              onClick={() => openOverride(selectedEmp, rec)}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-100 text-slate-400 hover:bg-violet-100 hover:text-violet-600 transition"
                              title="Adjust record"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                            </button>
                          </td>
                        )}
                        {!isAdmin && <td></td>}
                      </tr>
                    );
                  })
                ) : (
                  /* ── 2. ALL EMPLOYEES OVERVIEW ── */
                  filteredEmployees.map((emp, idx) => {
                    const rec = getEmployeeRecord(emp);
                    const ci = rec.checkIn || rec.check_in || '';
                    const co = rec.checkOut || rec.check_out || '';
                    const hours = ci && co ? calculateWorkHours(ci, co, rec.date) : '--';
                    const status = getAttendanceLabel(rec);
                    const ded = computeDeduction(emp, rec);
                    return (
                      <tr
                        key={emp.id}
                        className={`border-l-4 bg-white ${statusFlag(rec.status || rec.attendance_status || status)} transition-colors even:bg-slate-50/50 hover:bg-violet-50/30`}
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-400">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployeeId(String(emp.id));
                              setFilterDate(null);
                            }}
                            className="flex items-center gap-3 text-left group"
                            title="Click to view full month ledger for this employee"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-semibold text-white">
                              {initials(emp.name)}
                            </div>
                            <div>
                              <span className="whitespace-nowrap font-medium text-slate-800 group-hover:text-violet-600 transition-colors block">
                                {emp.name}
                              </span>
                              {emp.employee_code && (
                                <span className="text-[10px] font-mono text-slate-400 block">{emp.employee_code}</span>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">
                          {emp.monthly_salary ? `Rs.${(Number(emp.monthly_salary) / 30).toFixed(0)}/day` : '--'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {ded.amount === 0 ? (
                            <span className="text-xs font-medium text-emerald-600">No fine</span>
                          ) : (
                            <span className="font-mono text-xs font-semibold text-rose-600">
                              -Rs.{ded.amount} <span className="font-normal text-rose-400 text-[10px]">({ded.type.replace('_', ' ')})</span>
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{getDayName(rec.date)}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">{formatLocalDate(rec.date) || '--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{ci || '--:--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{co || '--:--'}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-indigo-700">{hours}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            (rec.mode === 'Biometric' || rec.mode === 'biometric') ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' :
                            rec.mode === 'Admin' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                            {(rec.mode === 'Biometric' || rec.mode === 'biometric') ? '⚡ Biometric' : rec.mode || '--'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(status)}`}>
                            {status === '--' ? 'Not marked' : status.replace('_', ' ')}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <button
                              onClick={() => openOverride(emp, rec)}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-100 text-slate-400 hover:bg-violet-100 hover:text-violet-600 transition"
                              title="Adjust record"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                            </button>
                          </td>
                        )}
                        {!isAdmin && <td></td>}
                      </tr>
                    );
                  })
                )}

                {((selectedEmp && displayedSingleRecords.length === 0) || (!selectedEmp && filteredEmployees.length === 0)) && (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-sm text-slate-400 font-medium">
                      No attendance records found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">Refreshes automatically · Click on any employee name to see their full month ledger.</p>
      </div>

      {overrideModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4" onMouseDown={()=>setOverrideModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden" onMouseDown={e=>e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Admin Override</p>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{overrideModal.emp.name}</h3>
                <p className="text-xs text-slate-400">Set timing manually — auto-calculates fine</p>
              </div>
              <button onClick={()=>setOverrideModal(null)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 border border-slate-200 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                <input type="date" value={overrideForm.date} onChange={e=>setOverrideForm(f=>({...f,date:e.target.value}))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Check-In Time</label>
                  <input type="time" value={overrideForm.check_in} onChange={e=>setOverrideForm(f=>({...f,check_in:e.target.value}))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Check-Out Time</label>
                  <input type="time" value={overrideForm.check_out} onChange={e=>setOverrideForm(f=>({...f,check_out:e.target.value}))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status Override (Optional)</label>
                <select value={overrideForm.status_override || 'AUTO'} onChange={e=>setOverrideForm(f=>({...f,status_override:e.target.value}))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
                  <option value="AUTO">Auto-calculate from times</option>
                  <option value="PRESENT">Present (No fine)</option>
                  <option value="ABSENT">Absent (Full cut)</option>
                  <option value="HALF_DAY">Half Day (Half cut)</option>
                  <option value="LATE">Late (Late fine)</option>
                </select>
              </div>
              {overrideForm.check_in&&(()=>{
                const mockRec={checkIn:overrideForm.check_in,checkOut:overrideForm.check_out,date:overrideForm.date};
                const d=computeDeduction(overrideModal.emp,mockRec);
                const label=d.type==='NONE'?'Full Day':'d.type=HALF_DAY'?'Half Day':d.type.replace('_',' ');
                return(
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Preview</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusPill(d.type==='NONE'?'COMPLETED':d.type)}`}>
                        {d.type==='NONE'?'Full Day':d.type.replace('_',' ')}
                      </span>
                      <span className={`font-mono text-sm font-bold ${d.amount===0?'text-emerald-600':'text-rose-600'}`}>
                        {d.amount===0?'No fine':`-Rs.${d.amount}`}
                      </span>
                    </div>
                  </div>
                );
              })()}
              {overrideMsg&&<p className={`text-xs font-semibold ${overrideMsg.includes('Saved')||overrideMsg.includes('success')?'text-emerald-600':'text-red-600'}`}>{overrideMsg}</p>}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={()=>setOverrideModal(null)} className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200 transition">Cancel</button>
              <button onClick={handleOverrideSave} disabled={overrideSaving||!overrideForm.date}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition active:scale-95 disabled:opacity-50">
                {overrideSaving?'Saving...':'Save Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



