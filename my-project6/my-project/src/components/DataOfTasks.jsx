import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

export default function DataOfTasks() {
  const { tasksList = [], fetchData, employeesList = [], departments = [] } = useOutletContext();
  
  // Modal States
  const [editingTask, setEditingTask] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  
  // For Edit Form
  const [assignMode, setAssignMode] = useState('single');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');

  const onDelete = async (id) => {
    const isConfirmed = await window.confirm("Are you sure you want to delete this task?");
    if (!isConfirmed) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      if (fetchData) fetchData();
    } catch (err) {
      alert("Delete failed!");
    }
  };

  const parseLocalDate = (rawDate) => {
    if (!rawDate) return '';
    // If it's exactly YYYY-MM-DD, return it safely.
    if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
      return rawDate.trim();
    }
    
    // Otherwise, parse it as a Date and extract local time
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate).split('T')[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return String(rawDate).split('T')[0];
    }
  };

  const formatDateDisplay = (rawDate) => {
    const parsed = parseLocalDate(rawDate);
    return parsed || 'N/A';
  };

  const toLocalDateKey = (value) => parseLocalDate(value);

  const localDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = localDate();
  const todayDate = new Date(`${todayStr}T00:00:00`);
  const weekEnd = new Date(todayDate);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const taskDateKey = (task) => toLocalDateKey(task.due_date || task.start_date || task.task_date || task.created_at);
  const taskDate = (task) => {
    const key = taskDateKey(task);
    return key ? new Date(`${key}T00:00:00`) : null;
  };

  const isOverdue = (task) => {
    if (task.status === 'Completed') return false;
    const dueKey = toLocalDateKey(task.due_date);
    if (!dueKey) return false;
    return dueKey < todayStr;
  };

  const activeTasks = tasksList.filter(t => t.status !== 'Completed');
  const completedTasks = tasksList.filter(t => t.status === 'Completed');

  const todayTasks = activeTasks.filter(t => taskDateKey(t) === todayStr || isOverdue(t));
  const weeklyTasks = activeTasks.filter(t => {
    if (todayTasks.includes(t)) return false;
    const date = taskDate(t);
    return date && date > todayDate && date <= weekEnd;
  });
  const monthlyTasks = activeTasks.filter(t => !todayTasks.includes(t) && !weeklyTasks.includes(t));

  const [collapsed, setCollapsed] = useState({ today: false, weekly: false, monthly: false, completed: false });

  const toggleSection = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const handleMarkComplete = async (task) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${task.id}`, { 
        ...task, 
        status: 'Completed',
        progress_percentage: 100 
      });
      if (fetchData) fetchData();
    } catch (err) { 
      alert("Failed to mark completed"); 
    }
  };

  const toggleGroupMember = (emp) => {
    setSelectedGroupMembers(prev => {
      const exists = prev.find(m => m.id === emp.id);
      if (exists) return prev.filter(m => m.id !== emp.id);
      return [...prev, emp];
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = { ...editingTask };
      
      if (assignMode === 'group') {
        updated.assignee_id = null;
        updated.assign_to = null;
        updated.group_member_ids = selectedGroupMembers.map(m => m.id);
        if (!updated.group_name) {
          updated.group_name = selectedGroupMembers.map(m => m.name).join(', ');
        }
      } else {
        updated.group_id = null;
        updated.group_name = null;
        updated.group_member_ids = [];
      }

      if (updated.status === 'Completed') updated.progress_percentage = 100;
      await axios.put(`${API_BASE_URL}/tasks/${editingTask.id}`, updated);
      alert("Task updated successfully!");
      setModalMode('view'); // Go back to view mode after saving
      if (fetchData) fetchData();
      
      // Update local task data for immediate view update without waiting for fetch
      setEditingTask({
        ...updated,
        group_members: assignMode === 'group' ? selectedGroupMembers.map(m => m.name).join(', ') : null
      });

    } catch (err) {
      alert("Failed to update task");
    }
  };

  const getPriorityColor = (priority) => {
    switch((priority || '').toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'normal': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-sky-100 text-sky-800';
      case 'On Hold': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const TaskSection = ({ data, title, sectionKey, badgeColor }) => (
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        onClick={() => toggleSection(sectionKey)}
        className="flex cursor-pointer select-none items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5 transition-colors hover:bg-slate-100/70"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
            {data.length} Tasks
          </span>
        </div>
        <span className={`text-[10px] font-semibold text-slate-400 transition-transform duration-200 ${collapsed[sectionKey] ? '-rotate-90' : 'rotate-0'}`}>
          ▼
        </span>
      </div>

      {!collapsed[sectionKey] && (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[850px]">
            <div className="grid grid-cols-[55px_65px_1.8fr_1.4fr_1.3fr_85px_95px_85px] gap-2 border-b border-slate-100 bg-white px-3 py-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ID</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Details</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned To</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start / Due</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status & %</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Actions</span>
            </div>

            {data.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.map((task, idx) => {
                  const overdue = isOverdue(task);
                  const startDateClean = formatDateDisplay(task.start_date || task.task_date);
                  const dueDateClean = formatDateDisplay(task.due_date);
                  const progress = task.status === 'Completed' ? 100 : (task.progress_percentage || 0);
                  const isGroup = !!task.group_name || !!task.group_members;

                  return (
                    <div 
                      key={task.id || idx} 
                      className={`grid grid-cols-[55px_65px_1.8fr_1.4fr_1.3fr_85px_95px_85px] items-center gap-2 px-3 py-2.5 transition-colors ${
                        task.status === 'Completed' ? 'bg-emerald-50/20 hover:bg-emerald-50/40' :
                        overdue ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50'
                      }`}
                    >

                    {/* Task ID */}
                    <div>
                      <span className="inline-block font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {task.id ? `TSK-${task.id}` : `TSK-${idx + 1}`}
                      </span>
                    </div>

                    {/* Task Type */}
                    <div>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        task.task_type === 'Client Task' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {task.task_type === 'Client Task' ? 'Client' : 'Self'}
                      </span>
                    </div>

                    {/* Task Details */}
                    <div className="pr-1">
                      {task.client_name && (
                        <p className="text-[9px] font-bold text-violet-700 truncate">
                          Client: {task.client_name}
                        </p>
                      )}
                      <p className="text-[11px] font-bold text-slate-800 leading-tight truncate" title={task.title}>{task.title || 'Untitled Task'}</p>
                    </div>

                    {/* Assigned To */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[8px] font-bold text-violet-700 border border-violet-200">
                        {isGroup ? '👥' : (task.assign_to || task.employee_name || 'U')[0]}
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-800 truncate leading-none">
                          {isGroup ? `${task.group_name || 'Group Task'}` : (task.assign_to || task.employee_name || 'Not Assigned')}
                        </p>
                        {isGroup && (
                          <p className="text-[8px] font-semibold text-slate-500 truncate mt-0.5" title={task.group_members}>
                            {task.group_members ? task.group_members.split(',').length : 0} Members
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="text-[9px] leading-tight">
                      <div><span className="text-slate-400">Start:</span> <span className="font-semibold text-slate-700">{startDateClean}</span></div>
                      <div>
                        <span className="text-slate-400">Due:</span> 
                        <span className={`font-bold ${overdue ? 'text-rose-600 font-black' : 'text-slate-700'}`}> {dueDateClean}</span>
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold border ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'Normal'}
                      </span>
                    </div>

                    {/* Status & Work Progress % */}
                    <div>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${getStatusColor(task.status)}`}>
                        {task.status || 'Pending'}
                      </span>

                      <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden border border-slate-200">
                        <div 
                          className={`h-1 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : 'bg-violet-500'}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      {overdue && (
                        <span className="block text-[8px] font-bold text-rose-500 leading-none mt-1">Overdue</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-1.5">
                      {task.status !== 'Completed' && (
                        <button 
                          title="Mark Complete" 
                          onClick={() => handleMarkComplete(task)} 
                          className="flex h-6 w-6 items-center justify-center rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold transition hover:bg-emerald-500 hover:text-white"
                        >
                          ✓
                        </button>
                      )}
                      <button 
                        title="View Details" 
                        onClick={() => {
                          const formatDateInput = (val) => parseLocalDate(val);
                          
                          // Pre-fill group members if it's a group task
                          const isGrp = !!task.group_id || !!task.group_name || !!task.group_members;
                          setAssignMode(isGrp ? 'group' : 'single');
                          if (isGrp && task.group_members) {
                            const names = task.group_members.split(',').map(n => n.trim());
                            const selected = employeesList.filter(emp => names.includes(emp.name));
                            setSelectedGroupMembers(selected);
                          } else {
                            setSelectedGroupMembers([]);
                          }

                          setEditingTask({
                            ...task,
                            start_date: formatDateInput(task.start_date || task.task_date),
                            due_date: formatDateInput(task.due_date)
                          });
                          setModalMode('view');
                        }} 
                        className="flex h-6 w-6 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold transition hover:bg-indigo-500 hover:text-white"
                      >
                        👁️
                      </button>
                      <button 
                        title="Delete Task" 
                        onClick={() => onDelete(task.id)} 
                        className="flex h-6 w-6 items-center justify-center rounded bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold transition hover:bg-rose-500 hover:text-white"
                      >
                        🗑
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50/30 py-6 text-center text-[11px] font-medium text-slate-400">
              No tasks found.
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Task Overview</h1>
            <p className="text-xs text-slate-500 font-medium">Manage and monitor team tasks</p>
          </div>
          <span className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <TaskSection data={todayTasks} title="Today & Overdue" sectionKey="today" badgeColor="bg-red-50 text-red-700 border border-red-200" />
        <TaskSection data={weeklyTasks} title="This Week" sectionKey="weekly" badgeColor="bg-amber-50 text-amber-700 border border-amber-200" />
        <TaskSection data={monthlyTasks} title="Other Active" sectionKey="monthly" badgeColor="bg-blue-50 text-blue-700 border border-blue-200" />
        <TaskSection data={completedTasks} title="Completed" sectionKey="completed" badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200" />
      </div>

      {/* TASK DETAILS MODAL (VIEW & EDIT) */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  {modalMode === 'view' ? 'Task Details' : 'Edit Task'}
                </h2>
                <span className="font-mono text-[10px] text-slate-400 font-bold">TSK-{editingTask.id}</span>
              </div>
              <div className="flex items-center gap-2">
                {modalMode === 'view' && (
                  <button 
                    onClick={() => {
                      const isGrp = !!editingTask.group_id || !!editingTask.group_name || !!editingTask.group_members;
                      setAssignMode(isGrp ? 'group' : 'single');
                      if (isGrp && editingTask.group_members) {
                        const names = editingTask.group_members.split(',').map(n => n.trim());
                        const selected = (employeesList || []).filter(emp => names.includes(emp.name));
                        setSelectedGroupMembers(selected);
                      } else {
                        setSelectedGroupMembers([]);
                      }
                      setModalMode('edit');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-[11px] font-bold hover:bg-violet-100 transition"
                  >
                    Edit
                  </button>
                )}
                <button 
                  onClick={() => setEditingTask(null)}
                  className="flex items-center justify-center w-7 h-7 bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full font-bold transition"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-5">
              {modalMode === 'view' ? (
                // VIEW MODE CONTENT
                <div className="space-y-6">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      editingTask.task_type === 'Client Task' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}>
                      {editingTask.task_type || 'Self Task'}
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getPriorityColor(editingTask.priority)}`}>
                      {editingTask.priority || 'Normal'} Priority
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusColor(editingTask.status)}`}>
                      {editingTask.status || 'Pending'}
                    </span>
                  </div>

                  {/* Title & Client */}
                  <div>
                    {editingTask.client_name && (
                      <p className="text-[11px] font-bold text-violet-600 mb-1">Client: {editingTask.client_name}</p>
                    )}
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{editingTask.title}</h3>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Assigned To</p>
                      {assignMode === 'group' ? (
                        <div>
                          <p className="text-xs font-bold text-slate-800">{editingTask.group_name || 'Group Task'}</p>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2" title={editingTask.group_members}>
                            {editingTask.group_members || 'No members'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-800">{editingTask.assign_to || editingTask.employee_name || 'Not Assigned'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Department</p>
                      <p className="text-xs font-bold text-slate-800">{editingTask.dept || 'General'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Start Date</p>
                      <p className="text-xs font-bold text-slate-800">{formatDateDisplay(editingTask.start_date || editingTask.task_date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Due Date</p>
                      <p className="text-xs font-bold text-slate-800">{formatDateDisplay(editingTask.due_date)}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Work Progress</p>
                      <span className="text-[11px] font-bold text-violet-700">{editingTask.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-2 rounded-full ${editingTask.status === 'Completed' ? 'bg-emerald-500' : 'bg-violet-600'}`} 
                        style={{ width: `${editingTask.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Description */}
                  {editingTask.description && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Description & Remarks</p>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {editingTask.description}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // EDIT MODE CONTENT
                <form id="editTaskForm" onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Task Type</label>
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none"
                        value={editingTask.task_type || 'Self Task'}
                        onChange={e => setEditingTask({ ...editingTask, task_type: e.target.value })}
                      >
                        <option value="Self Task">Self Task</option>
                        <option value="Client Task">Client Task</option>
                      </select>
                    </div>
                    {editingTask.task_type === 'Client Task' && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Client Name</label>
                        <input 
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                          value={editingTask.client_name || ''}
                          onChange={e => setEditingTask({ ...editingTask, client_name: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Task Title</label>
                    <input 
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:border-violet-400 outline-none"
                      value={editingTask.title || ''}
                      onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Assignment Toggle */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex bg-slate-100 rounded-lg p-1 mb-3">
                      <button
                        type="button"
                        onClick={() => setAssignMode('single')}
                        className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition ${
                          assignMode === 'single' ? 'bg-white text-violet-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Single User
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignMode('group')}
                        className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition ${
                          assignMode === 'group' ? 'bg-white text-violet-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Group
                      </button>
                    </div>

                    {assignMode === 'single' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assign To</label>
                          <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                            value={editingTask.assign_to || ''}
                            onChange={e => setEditingTask({ ...editingTask, assign_to: e.target.value, assignee_id: null })}
                          >
                            <option value="">Select Employee</option>
                            {employeesList && employeesList.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                          <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                            value={editingTask.dept || ''}
                            onChange={e => setEditingTask({ ...editingTask, dept: e.target.value })}
                          >
                            <option value="">Select Dept</option>
                            {departments && departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Group Name</label>
                          <input 
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                            placeholder="E.g. Development Team"
                            value={editingTask.group_name || ''}
                            onChange={e => setEditingTask({ ...editingTask, group_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-500">Select Group Members</label>
                            <div className="relative">
                              <input 
                                type="text"
                                placeholder="🔍 Search employees..."
                                className="p-1 px-2 pr-6 border border-slate-200 rounded text-[10px] w-32 outline-none focus:border-violet-500"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                              />
                              {memberSearch && (
                                <button 
                                  type="button"
                                  onClick={() => setMemberSearch('')}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 font-bold"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {selectedGroupMembers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-white rounded-lg border border-slate-200">
                              {selectedGroupMembers.map(m => (
                                <span key={m.id} className="inline-flex items-center gap-1 bg-violet-50 px-2 py-1 rounded text-[10px] font-bold text-violet-700 border border-violet-200">
                                  {m.name}
                                  <button
                                    type="button"
                                    onClick={() => toggleGroupMember(m)}
                                    className="text-violet-400 hover:text-red-500 font-bold ml-1"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-0.5">
                            {(employeesList || []).filter(emp => emp.name.toLowerCase().includes(memberSearch.toLowerCase()) || (emp.department && emp.department.toLowerCase().includes(memberSearch.toLowerCase()))).map(emp => {
                              const isSelected = selectedGroupMembers.some(m => m.id === emp.id);
                              return (
                                <label key={emp.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected} 
                                    onChange={() => toggleGroupMember(emp)} 
                                    className="accent-violet-600 w-3 h-3"
                                  />
                                  <span className="text-[11px] font-bold text-slate-700">{emp.name}</span>
                                </label>
                              );
                            })}
                            {(employeesList || []).filter(emp => emp.name.toLowerCase().includes(memberSearch.toLowerCase()) || (emp.department && emp.department.toLowerCase().includes(memberSearch.toLowerCase()))).length === 0 && (
                              <div className="text-center text-[10px] text-slate-400 py-2">No employees found.</div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                          <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                            value={editingTask.dept || ''}
                            onChange={e => setEditingTask({ ...editingTask, dept: e.target.value })}
                          >
                            <option value="">Select Dept</option>
                            {departments && departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Start Date</label>
                      <input 
                        type="date"
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                        value={editingTask.start_date || editingTask.task_date || ''}
                        onChange={e => setEditingTask({ ...editingTask, start_date: e.target.value, task_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Due Date</label>
                      <input 
                        type="date"
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                        value={editingTask.due_date || ''}
                        onChange={e => setEditingTask({ ...editingTask, due_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Priority</label>
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:border-violet-400 outline-none"
                        value={editingTask.priority || 'Normal'}
                        onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Status</label>
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:border-violet-400 outline-none"
                        value={editingTask.status || 'Pending'}
                        onChange={e => {
                          const st = e.target.value;
                          setEditingTask({ 
                            ...editingTask, 
                            status: st,
                            progress_percentage: st === 'Completed' ? 100 : editingTask.progress_percentage
                          });
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Work Progress %</label>
                      <span className="text-[11px] font-bold text-violet-700">{editingTask.progress_percentage || 0}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={editingTask.progress_percentage || 0}
                      onChange={e => setEditingTask({ ...editingTask, progress_percentage: parseInt(e.target.value) })}
                      className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description / Remarks</label>
                    <textarea 
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs h-20 focus:border-violet-400 outline-none"
                      value={editingTask.description || ''}
                      onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                      placeholder="Task details and remarks..."
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            {modalMode === 'edit' && (
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setModalMode('view')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-50 transition"
                >
                  Cancel Edit
                </button>
                <button 
                  type="submit"
                  form="editTaskForm"
                  className="px-6 py-2 bg-violet-700 text-white font-bold rounded-lg text-xs hover:bg-violet-800 shadow transition"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
