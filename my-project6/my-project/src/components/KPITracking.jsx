import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  Search,
  Download,
  Filter,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function KPITracking() {
  const [kpis, setKpis] = useState([]);
  const [form, setForm] = useState({
    employee: '',
    department: '',
    target: '',
    achieved: '',
    progress: '',
    status: '',
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState('');

  const handleChange = (field, value) => {
    if (field === 'employee') {
      const selected = employees.find((emp) => emp.name === value);
      if (selected) {
        setForm((prev) => ({
          ...prev,
          employee: selected.name,
          department: selected.department || prev.department,
        }));
        return;
      }
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE_URL}/kpi/add`, {
        ...form,
        progress: Number(form.progress || 0),
      });
      setMessage('KPI saved successfully.');
      setForm({ employee: '', department: '', target: '', achieved: '', progress: '', status: '' });
      fetchKpis();
    } catch (err) {
      console.error(err);
      setMessage('Could not save KPI.');
    }
  };

  const exportKpis = () => {
    const headers = ['Employee', 'Department', 'Target', 'Achieved', 'Progress', 'Status'];
    const rows = kpis.map((item) => [
      item.employee || item.name,
      item.department,
      item.target,
      item.achieved,
      item.progress,
      item.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'kpi-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchKpis = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/kpi/all`);
      if (res && res.data) {
        setKpis(res.data);
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`);
      if (res && res.data) {
        setEmployees(res.data);
        const uniqueDepartments = Array.from(new Set(res.data.map((emp) => emp.department).filter(Boolean)));
        setDepartments(uniqueDepartments);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchKpis();
    fetchEmployees();
  }, []);

  // Calculate Real Data Stats
  const totalKpis = kpis.length;
  const avgPerformance = totalKpis > 0 
    ? (kpis.reduce((acc, curr) => acc + (parseFloat(curr.progress) || 0), 0) / totalKpis).toFixed(0) 
    : 0;
  
  // Define "Achieved" as progress >= 80% or status Excellent/Good
  const goalsAchieved = kpis.filter(k => (parseFloat(k.progress) || 0) >= 80 || k.status?.toLowerCase() === 'excellent' || k.status?.toLowerCase() === 'good').length;
  
  // Define "At Risk" as progress < 40% or status Poor
  const atRisk = kpis.filter(k => (parseFloat(k.progress) || 0) < 40 || k.status?.toLowerCase() === 'poor' || k.status?.toLowerCase() === 'needs improvement' || k.status?.toLowerCase() === 'at risk').length;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            KPI Tracking
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor employee performance against business goals and key performance indicators.
          </p>
        </div>
        <button
          onClick={exportKpis}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-5">
          <Target className="text-indigo-600 mb-4" size={35} />
          <p className="text-gray-500">Total KPIs</p>
          <h2 className="text-4xl font-bold mt-2">{totalKpis}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <TrendingUp className="text-green-600 mb-4" size={35} />
          <p className="text-gray-500">Average Performance</p>
          <h2 className="text-4xl font-bold mt-2">{avgPerformance}%</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <CheckCircle2 className="text-blue-600 mb-4" size={35} />
          <p className="text-gray-500">Goals Achieved</p>
          <h2 className="text-4xl font-bold mt-2">{goalsAchieved}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <AlertTriangle className="text-red-500 mb-4" size={35} />
          <p className="text-gray-500">At Risk</p>
          <h2 className="text-4xl font-bold mt-2">{atRisk}</h2>
        </div>
      </div>

      {/* KPI Save Form */}
      <div className="mb-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-violet-950 mb-4">Add KPI Record</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <select
            value={form.employee}
            onChange={(e) => handleChange('employee', e.target.value)}
            className="border rounded-2xl p-4"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.name}>
                {emp.name}
              </option>
            ))}
          </select>
          <select
            value={form.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className="border rounded-2xl p-4"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <input
            value={form.target}
            onChange={(e) => handleChange('target', e.target.value)}
            placeholder="Target"
            className="border rounded-2xl p-4"
          />
          <input
            value={form.achieved}
            onChange={(e) => handleChange('achieved', e.target.value)}
            placeholder="Achieved"
            className="border rounded-2xl p-4"
          />
          <input
            value={form.progress}
            onChange={(e) => handleChange('progress', e.target.value)}
            type="number"
            placeholder="Progress (%)"
            className="border rounded-2xl p-4"
          />
          <input
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            placeholder="Status"
            className="border rounded-2xl p-4"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Save KPI
          </button>
          {message ? <span className="text-sm text-slate-600">{message}</span> : null}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <div className="flex min-w-[620px] flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between border-b">
          <h2 className="text-xl font-semibold">
            Employee KPI Overview
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Employee"
                className="border rounded-xl pl-10 pr-4 py-2"
              />
            </div>
            <button className="border rounded-xl px-4 flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-4">Employee</th>
              <th>Department</th>
              <th>Target</th>
              <th>Achieved</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">
                  {item.employee || item.name}
                </td>
                <td>{item.department}</td>
                <td>{item.target}</td>
                <td>{item.achieved}</td>
                <td className="w-72">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.status === "Excellent"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Good"
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "Average"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {kpis.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No KPI records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
