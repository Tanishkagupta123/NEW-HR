import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminHome() {
  const [dashboard, setDashboard] = useState({
    counts: { employees: 0, present: 0, onLeave: 0, payroll: 0, tasks: 0, completedTasks: 0, pendingTasks: 0 },
    recentEmployees: [],
    recentTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    axios.get(`${API_BASE_URL}/dashboard/summary`)
      .then(({ data }) => { if (mounted) setDashboard(data); })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || 'Dashboard data could not be loaded. Please check that the backend is running.');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const { counts, recentEmployees = [], recentTasks = [] } = dashboard;
  const taskProgress = counts.tasks ? Math.round((counts.completedTasks / counts.tasks) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">HR Dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">A live overview of your workforce and daily activity.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">● Live data</span>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Employees', loading ? '—' : counts.employees],
          ['Present Today', loading ? '—' : counts.present],
          ['On Leave Today', loading ? '—' : counts.onLeave],
          ['Monthly Payroll', loading ? '—' : `₹${Number(counts.payroll || 0).toLocaleString('en-IN')}`]
        ].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-400">{label}</div><div className="text-3xl font-bold text-slate-800">{value}</div></div>)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-violet-950 p-4 text-white shadow-sm sm:p-6">
          <p className="text-sm text-violet-200">Task completion</p>
          <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-black">{loading ? '—' : `${taskProgress}%`}</span><span className="mb-1 text-sm text-violet-200">complete</span></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-violet-800"><div className="h-full rounded-full bg-violet-300" style={{ width: `${taskProgress}%` }} /></div>
          <p className="mt-3 text-xs text-violet-200">{counts.completedTasks} completed · {counts.pendingTasks} pending</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-800">Recent tasks</h3>
          <div className="mt-3 divide-y divide-slate-100">
            {recentTasks.length ? recentTasks.map(task => <div key={task.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold text-slate-700">{task.title}</p><p className="text-xs text-slate-400">Assigned to {task.assignee}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{task.status || 'Pending'}</span></div>) : <p className="py-5 text-sm text-slate-400">No tasks have been added yet.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <h3 className="font-bold text-slate-800">Recently added employees</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {recentEmployees.length ? recentEmployees.map(employee => <div key={employee.id} className="rounded-lg bg-slate-50 p-4"><p className="truncate font-bold text-slate-700">{employee.name}</p><p className="mt-1 text-xs text-slate-400">{employee.department || 'No department'}</p><p className="mt-1 text-xs text-violet-600">{employee.role_position || employee.position || 'Employee'}</p></div>) : <p className="col-span-full py-3 text-sm text-slate-400">No employees have been added yet.</p>}
        </div>
      </div>
    </div>
  );
}
