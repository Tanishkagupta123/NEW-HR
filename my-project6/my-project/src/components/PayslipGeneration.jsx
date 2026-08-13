import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, Mail, FileText, Search, X } from "lucide-react"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PayslipGeneration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("June 2026");
  const [employees, setEmployees] = useState([]); 
  const [selectedEmp, setSelectedEmp] = useState(null);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const fetchPayslips = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/payslip/all?search=${searchTerm}&month=${selectedMonth}`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [searchTerm, selectedMonth]);

  const handleView = (emp) => {
    setSelectedEmp(emp);
  };

  // PDF Generation Logic - FIXED
  const handleDownload = (emp) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("SALARY SLIP", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Employee: ${emp.employee_name}`, 14, 30);
    
    // autoTable(doc, { ... }) ka sahi syntax
    autoTable(doc, {
      startY: 35,
      head: [['Description', 'Amount (₹)']],
      body: [
        ['Basic Salary', emp.basic_salary || 0],
        ['HRA', emp.house_rent || 0],
        ['Medical', emp.medical || 0],
        ['Travel', emp.travel || 0],
        ['Bonus', emp.bonus || 0],
        ['Overtime', emp.overtime || 0],
        ['PF (Deduction)', `-${emp.pf || 0}`],
        ['ESI (Deduction)', `-${emp.esi || 0}`],
        ['Tax (Deduction)', `-${emp.tax || 0}`],
        ['Leaves/Other Deductions', `-${Number(emp.leave_deduction || 0) + Number(emp.other_deduction || 0)}`],
        ['Gross Salary', emp.gross_salary || 0],
        ['NET SALARY', emp.net_salary || 0],
      ],
      theme: 'striped',
    });
    
    doc.save(`${emp.employee_name}_Payslip.pdf`);
  };

  const handleMail = async (emp) => {
    try {
      await axios.post(`${API_BASE_URL}/payslip/send-mail`, emp);
      alert(`Email sent successfully to ${emp.employee_name}`);
    } catch (err) {
      alert("Failed to send email.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-violet-900">Payslip Generation</h1>
          <p className="text-slate-500 mt-1">Manage and distribute employee salary slips.</p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto sm:gap-4">
          <div className="flex-1 bg-white p-4 rounded-2xl border shadow-sm text-center sm:flex-none sm:px-6">
            <p className="text-xs text-slate-400 uppercase font-bold">Processed</p>
            <h3 className="text-2xl font-bold text-green-600">{employees.filter(e=>e.status==="Generated").length}</h3>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl border shadow-sm text-center sm:flex-none sm:px-6">
            <p className="text-xs text-slate-400 uppercase font-bold">Pending</p>
            <h3 className="text-2xl font-bold text-yellow-600">{employees.filter(e=>e.status==="Pending").length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-3xl border shadow-sm mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center bg-slate-100 px-4 py-2 rounded-xl border w-full md:w-64">
          <Search size={18} className="text-slate-400 mr-2" />
          <input type="text" placeholder="Search employee..." className="bg-transparent outline-none w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="w-full px-4 py-2 rounded-xl border bg-white outline-none sm:w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months.map((m) => (<option key={m} value={`${m} 2026`}>{m} 2026</option>))}
        </select>
        <button onClick={() => { setSearchTerm(""); setSelectedMonth("June 2026"); }} className="w-full px-6 py-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100 sm:w-auto">Reset</button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-5 font-semibold text-slate-600">Employee Name</th>
              <th className="p-5 font-semibold text-slate-600">Basic Salary</th>
              <th className="p-5 font-semibold text-slate-600">Net Salary</th>
              <th className="p-5 font-semibold text-slate-600">Status</th>
              <th className="p-5 font-semibold text-slate-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-slate-50">
                  <td className="p-5 font-bold text-slate-800">{emp.employee_name}</td>
                  <td className="p-5 text-slate-600">₹{emp.basic_salary}</td>
                  <td className="p-5 font-bold text-violet-600">₹{emp.net_salary}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.status === "Generated" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-5 flex justify-center gap-3">
                    <button onClick={() => handleView(emp)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"><FileText size={18} /></button>
                    <button onClick={() => handleDownload(emp)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"><Download size={18} /></button>
                    <button onClick={() => handleMail(emp)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"><Mail size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-10 text-center text-slate-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedEmp(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 p-1 rounded-full"
            >
              <X size={24}/>
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-violet-900">Salary Breakdown</h2>
              <p className="text-slate-500 text-sm mt-1">{selectedMonth} - {selectedEmp.employee_name}</p>
            </div>
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Basic:</span> <b>₹{selectedEmp.basic_salary || 0}</b></div>
                <div className="flex justify-between"><span>HRA:</span> <b>₹{selectedEmp.house_rent || 0}</b></div>
                <div className="flex justify-between"><span>Medical:</span> <b>₹{selectedEmp.medical || 0}</b></div>
                <div className="flex justify-between"><span>Travel:</span> <b>₹{selectedEmp.travel || 0}</b></div>
                <div className="flex justify-between"><span>Bonus:</span> <b>₹{selectedEmp.bonus || 0}</b></div>
                <div className="flex justify-between"><span>OT:</span> <b>₹{selectedEmp.overtime || 0}</b></div>
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-red-600">
                <div className="flex justify-between"><span>PF:</span> <b>-₹{selectedEmp.pf || 0}</b></div>
                <div className="flex justify-between"><span>ESI:</span> <b>-₹{selectedEmp.esi || 0}</b></div>
                <div className="flex justify-between"><span>Tax:</span> <b>-₹{selectedEmp.tax || 0}</b></div>
                <div className="flex justify-between"><span>Leaves/Other:</span> <b>-₹{Number(selectedEmp.leave_deduction || 0) + Number(selectedEmp.other_deduction || 0)}</b></div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-lg font-bold text-slate-900 px-2">
                <span>Gross:</span> <span>₹{selectedEmp.gross_salary || 0}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-violet-700 bg-violet-50 p-3 rounded-xl border border-violet-100">
                <span>Net Salary:</span> <span>₹{selectedEmp.net_salary || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
