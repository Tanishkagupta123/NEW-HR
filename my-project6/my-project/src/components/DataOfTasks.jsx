import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

export default function DataOfTasks() {
  const { tasksList = [], fetchData } = useOutletContext();

  const onDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed!");
    }
  };

  // Automatic Date Segregation (Today, Weekly, Monthly)
  const localDate = () => {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
  };
  const todayStr = localDate();
  const todayDate = new Date(`${todayStr}T00:00:00`);
  const weekEnd = new Date(todayDate);
  weekEnd.setDate(weekEnd.getDate() + 7);
  // MySQL returns DATE values as UTC timestamps (e.g. 27T18:30Z is 28th in India),
  // so convert each value back to the browser's local calendar date before grouping.
  const toLocalDateKey = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000)).toISOString().slice(0, 10);
  };
  const taskDateKey = (task) => toLocalDateKey(task.task_date || task.created_at);
  const taskDate = (task) => {
    const key = taskDateKey(task);
    return key ? new Date(`${key}T00:00:00`) : null;
  };

  const todayTasks = tasksList.filter(t => taskDateKey(t) === todayStr);
  const weeklyTasks = tasksList.filter(t => {
    const date = taskDate(t);
    return date && taskDateKey(t) !== todayStr && date > todayDate && date <= weekEnd;
  });
  const monthlyTasks = tasksList.filter(t => !todayTasks.includes(t) && !weeklyTasks.includes(t));

  const [collapsed, setCollapsed] = useState({ today: false, weekly: false, monthly: false });
  const [remarks, setRemarks] = useState({});
  const [extraTimes, setExtraTimes] = useState({});

  const toggleSection = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const handleUpdate = async (task, type) => {
    let updatedData = { ...task };
    if (type === 'complete') {
      updatedData.status = 'Completed';
    } else if (type === 'save') {
      if (extraTimes[task.id] !== undefined) updatedData.extra_time = extraTimes[task.id];
      if (remarks[task.id] !== undefined) updatedData.description = remarks[task.id];
    }
    try {
      await axios.put(`${API_BASE_URL}/tasks/${task.id}`, updatedData);
      fetchData();
    } catch (err) { alert("Update failed!"); }
  };

  const TaskSection = ({ data, title, sectionKey, badgeColor }) => (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Section header */}
      <div
        onClick={() => toggleSection(sectionKey)}
        className="flex cursor-pointer select-none items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 transition-colors hover:bg-slate-100/70"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
            {data.length} Tasks
          </span>
        </div>
        <span className={`text-xs font-semibold text-slate-400 transition-transform duration-200 ${collapsed[sectionKey] ? '-rotate-90' : 'rotate-0'}`}>
          ▼
        </span>
      </div>

      {!collapsed[sectionKey] && (
        <>
          {/* Column titles */}
          <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_1.5fr_1.2fr] gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-3 md:grid">
            {['Client & Task Details', 'Assigned Employee', 'Current Status', 'Extra Time', 'Manager Remarks', 'Actions'].map((h, i) => (
              <span key={i} className={`text-[11px] font-semibold uppercase tracking-wide text-slate-400 ${i === 5 ? 'text-center' : 'text-left'}`}>{h}</span>
            ))}
          </div>

          {data.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.map((task) => {
                const isHighPriority = task.priority?.toLowerCase() === 'high';

                return (
                  <div key={task.id} className="grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70 md:grid-cols-[2fr_1.2fr_1fr_1fr_1.5fr_1.2fr]">

                    {/* Client & Task Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{task.client_name || 'N/A'}</p>
                        {isHighPriority && (
                          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 ring-1 ring-red-100">High</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{task.title}</p>
                      {task.task_date && (
                        <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 ring-1 ring-indigo-100">
                          Target: {task.task_date}
                        </span>
                      )}
                    </div>

                    {/* Employee */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-semibold uppercase text-white">
                        {(task.assign_to || task.employee_name || 'U')[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-none text-slate-800">{task.assign_to || task.employee_name || 'Not Assigned'}</p>
                        <p className="mt-1 text-[10px] text-slate-400">Dept: {task.dept || 'General'}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                      }`}>
                        {task.status === 'Completed' ? '✓ ' : ''}{task.status || 'Pending'}
                      </span>
                    </div>

                    {/* Extra Time */}
                    <div>
                      <input
                        type="text"
                        defaultValue={task.extra_time || '0'}
                        onChange={e => setExtraTimes(p => ({ ...p, [task.id]: e.target.value }))}
                        className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center text-xs font-medium text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                        placeholder="0h"
                      />
                    </div>

                    {/* Remarks */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        defaultValue={task.description || ''}
                        onChange={e => setRemarks(p => ({ ...p, [task.id]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                        placeholder="Add feedback..."
                      />
                      <button
                        onClick={() => handleUpdate(task, 'save')}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-slate-100 text-xs text-slate-500 transition-all hover:bg-violet-600 hover:text-white active:scale-90"
                        title="Save Changes"
                      >
                        ✓
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-start gap-1.5 md:justify-center">
                      <button title="Mark Complete" onClick={() => handleUpdate(task, 'complete')} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-emerald-500 text-xs text-white transition-all hover:bg-emerald-600 active:scale-90">✓</button>
                      <button title="Upload Documents" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-sky-500 text-xs text-white transition-all hover:bg-sky-600 active:scale-90">↑</button>
                      <button title="Delete Permanent" onClick={() => onDelete(task.id)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-rose-500 text-xs text-white transition-all hover:bg-rose-600 active:scale-90">🗑</button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50/30 py-12 text-center text-sm text-slate-400">
              No active tasks found in this section.
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F5FB] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
              HR · Operations
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-800">Data of Tasks</h1>
            <p className="mt-1 text-sm text-slate-500">Operational activity logs, grouped by deadline.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Categorized Lists */}
        <TaskSection data={todayTasks} title="Today's Tasks & Urgent Deadlines" sectionKey="today" badgeColor="bg-red-50 text-red-600 ring-1 ring-red-100" />
        <TaskSection data={weeklyTasks} title="This Week's Active Progress" sectionKey="weekly" badgeColor="bg-amber-50 text-amber-600 ring-1 ring-amber-100" />
        <TaskSection data={monthlyTasks} title="Other Tasks List" sectionKey="monthly" badgeColor="bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" />
      </div>
    </div>
  );
}
