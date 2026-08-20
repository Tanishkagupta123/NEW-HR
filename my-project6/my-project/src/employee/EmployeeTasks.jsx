import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(null);

  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  };

  const blankTask = () => ({
    task_type: 'Self Task',
    client_name: '',
    title: '',
    start_date: getLocalDate(),
    due_date: getLocalDate(),
    status: 'Pending',
    priority: 'Normal',
    description: ''
  });

  const [newTask, setNewTask] = useState(blankTask);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let myTasks = [];
      try {
        if (user.id) {
          const res = await axios.get(`${API_BASE_URL}/tasks/employee/${user.id}`);
          myTasks = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
        }
      } catch (e) {}

      if (!myTasks.length) {
        const res = await axios.get(`${API_BASE_URL}/tasks`);
        const allTasks = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
        myTasks = allTasks.filter(t => {
          const assigned = String(t.assign_to || "").toLowerCase().trim();
          const userName = String(user.name || "").toLowerCase().trim();
          const userId = String(user.id || "").toLowerCase().trim();
          const groupMembers = String(t.group_members || "").toLowerCase();
          return assigned === userId || assigned === userName || groupMembers.includes(userName);
        });
      }

      setTasks(myTasks);
    } catch (err) {
      console.error("Task load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSelfAssign = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        ...newTask,
        assign_to: user.name,
        dept: user.department || 'General'
      });
      alert("Task created successfully!");
      setNewTask(blankTask());
      setShowForm(false);
      fetchTasks();
    } catch (err) { alert("Failed to assign task"); }
  };

  const today = getLocalDate();
  const startOfToday = new Date(`${today}T00:00:00`);
  const withinNextWeek = new Date(startOfToday);
  withinNextWeek.setDate(withinNextWeek.getDate() + 7);

  const parseLocalDate = (rawDate) => {
    if (!rawDate) return '';
    if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
      return rawDate.trim();
    }
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

  const toLocalDateKey = (dateVal) => parseLocalDate(dateVal);

  const formatDateDisplay = (rawDate) => {
    const parsed = parseLocalDate(rawDate);
    if (!parsed) return '-';
    // Format YYYY-MM-DD to DD-MMM-YYYY manually to avoid timezone shift on new Date(parsed)
    const [y, m, d] = parsed.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d}-${months[parseInt(m, 10) - 1]}-${y}`;
  };

  const isOverdue = (task) => {
    if (task.status === 'Completed') return false;
    const dueKey = toLocalDateKey(task.due_date);
    if (!dueKey) return false;
    return dueKey < today;
  };

  const taskDateKey = (task) => toLocalDateKey(task.due_date || task.start_date || task.task_date || task.created_at);
  const dateOf = (task) => {
    const key = taskDateKey(task);
    return key ? new Date(`${key}T00:00:00`) : null;
  };

  const todayTasks = tasks.filter(task => taskDateKey(task) === today || isOverdue(task));
  const weekTasks = tasks.filter(task => {
    if (todayTasks.includes(task)) return false;
    const date = dateOf(task);
    return date && date > startOfToday && date <= withinNextWeek;
  });
  const otherTasks = tasks.filter(task => !todayTasks.includes(task) && !weekTasks.includes(task));

  const statusConfig = {
    'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'On Hold': { bg: 'bg-amber-100', text: 'text-amber-800' },
    'Pending': { bg: 'bg-slate-100', text: 'text-slate-700' },
  };

  const priorityConfig = {
    'Urgent': { color: 'text-red-700' },
    'High': { color: 'text-orange-700' },
    'Normal': { color: 'text-blue-700' },
    'Low': { color: 'text-slate-600' },
  };

  const TaskCard = ({ t, idx }) => {
    const overdue = isOverdue(t);
    const sc = statusConfig[t.status] || statusConfig['Pending'];
    const pc = priorityConfig[t.priority] || priorityConfig['Normal'];
    const progress = t.status === 'Completed' ? 100 : (t.progress_percentage || 0);

    return (
      <div className={`rounded-xl bg-white border p-5 shadow-sm transition-all duration-200 ${
        overdue ? 'border-red-200' : 'border-slate-200 hover:border-violet-300'
      }`}>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {t.id ? `TSK-${t.id}` : `TSK-${idx+1}`}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                t.task_type === 'Client Task' 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                  : 'bg-teal-50 text-teal-700 border border-teal-200'
              }`}>
                {t.task_type || 'Self Task'}
              </span>
              {t.client_name && (
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  Client: {t.client_name}
                </span>
              )}
              {overdue && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  OVERDUE
                </span>
              )}
            </div>
            <h4 className="text-[15px] font-bold text-slate-900 leading-snug">{t.title || 'Untitled Task'}</h4>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`${sc.bg} ${sc.text} px-2.5 py-1 rounded text-[11px] font-bold`}>
              {t.status || 'Pending'}
            </span>
            <button 
              onClick={() => setUpdatingTask(t)}
              className="px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded text-[11px] font-bold hover:bg-violet-600 hover:text-white transition"
            >
              Update
            </button>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-slate-500 mb-3 border-b border-slate-50 pb-3">
          <span>
            <span className="font-medium">Start:</span> <strong className="text-slate-700">{formatDateDisplay(t.start_date || t.task_date)}</strong>
          </span>
          <span>
            <span className="font-medium">Due:</span> <strong className={overdue ? 'text-red-600' : 'text-slate-700'}>{formatDateDisplay(t.due_date)}</strong>
          </span>
          <span>
            <span className="font-medium">Priority:</span> <strong className={`${pc.color}`}>{t.priority || 'Normal'}</strong>
          </span>
        </div>

        {/* Group Info */}
        {(t.group_name || t.group_members) && (
          <div className="mb-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
            <p className="text-[12px] font-bold text-slate-700 mb-2">
              {t.group_name ? `Group: ${t.group_name}` : 'Group Task'}
            </p>
            {t.group_members && (
              <div className="flex flex-wrap gap-1.5">
                {t.group_members.split(',').map((name, i) => {
                  const isMe = name.trim().toLowerCase() === (user.name || '').toLowerCase();
                  return (
                    <span 
                      key={i} 
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        isMe
                          ? 'bg-violet-100 text-violet-800 border-violet-200 font-bold' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {name.trim()}{isMe && ' (You)'}
                    </span>
                  );
                })}
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-2">
              Assigned to your group.
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Progress</span>
            <span className="text-[11px] font-bold text-slate-700">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                progress === 100 ? 'bg-emerald-500' : 'bg-violet-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Description */}
        {t.description && (
          <div className="text-[12px] text-slate-600 leading-relaxed mt-2">
            <span className="font-semibold text-slate-700">Remarks:</span> {t.description}
          </div>
        )}
      </div>
    );
  };

  const TaskGroup = ({ title, items, emptyText, accentColor }) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-600">{title}</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${accentColor}`}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-center">
          <p className="text-xs text-slate-500 font-medium">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t, idx) => <TaskCard key={t.id || idx} t={t} idx={idx} />)}
        </div>
      )}
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">My Assigned Tasks</h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">Tasks assigned to you by Admin, Group Tasks & Self Tasks</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-violet-900 text-white rounded-xl font-bold text-sm hover:bg-violet-800 transition shadow"
          >
            {showForm ? 'Cancel' : '+ Add Self Task'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', count: tasks.length, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
            { label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
            { label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
            { label: 'Overdue', count: tasks.filter(t => isOverdue(t)).length, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} ${s.border} border rounded-xl px-4 py-3 text-center`}>
              <p className={`${s.text} text-[10px] font-bold uppercase tracking-wider`}>{s.label}</p>
              <p className={`${s.text} text-2xl font-black mt-1`}>{s.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Self Task Form */}
      {showForm && (
        <form onSubmit={handleSelfAssign} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Add New Self Task</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Task Type</label>
              <select 
                value={newTask.task_type} 
                className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none"
                onChange={(e) => setNewTask({...newTask, task_type: e.target.value})}
              >
                <option value="Self Task">Self Task</option>
                <option value="Client Task">Client Task</option>
              </select>
            </div>

            {newTask.task_type === 'Client Task' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name</label>
                <input 
                  placeholder="Enter Client Name" 
                  value={newTask.client_name} 
                  className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none" 
                  onChange={(e) => setNewTask({...newTask, client_name: e.target.value})} 
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Task Title</label>
              <input 
                placeholder="Enter Task Title" 
                value={newTask.title} 
                className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none" 
                onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
              <input type="date" value={newTask.start_date} className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 outline-none" onChange={(e) => setNewTask({...newTask, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
              <input type="date" value={newTask.due_date} className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 outline-none" onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select value={newTask.priority} className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 outline-none" onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select value={newTask.status} className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:border-violet-400 outline-none" onChange={(e) => setNewTask({...newTask, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea placeholder="Description..." value={newTask.description} className="w-full p-2 rounded-lg border border-slate-200 text-sm h-20 focus:border-violet-400 outline-none" onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
          </div>

          <button type="submit" className="w-full py-2.5 bg-violet-700 text-white rounded-lg font-bold text-sm hover:bg-violet-800 transition">
            Submit Task
          </button>
        </form>
      )}

      {/* Tasks Content */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-slate-500 font-medium">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-500 font-medium">No tasks assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <TaskGroup title="Today's & Overdue" items={todayTasks} emptyText="No tasks due today." accentColor="bg-red-50 text-red-700 border border-red-200" />
          <TaskGroup title="This Week" items={weekTasks} emptyText="No tasks this week." accentColor="bg-amber-50 text-amber-700 border border-amber-200" />
          <TaskGroup title="Other Tasks" items={otherTasks} emptyText="No other tasks." accentColor="bg-blue-50 text-blue-700 border border-blue-200" />
        </div>
      )}

      {/* Update Status Modal */}
      {updatingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-lg border border-slate-100 p-5 relative">
            <button onClick={() => setUpdatingTask(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Update Task</h3>
              <p className="text-xs text-slate-600 mt-1">{updatingTask.title}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pending', 'In Progress', 'Completed', 'On Hold'].map(st => {
                    const isSelected = updatingTask.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setUpdatingTask({
                          ...updatingTask,
                          status: st,
                          progress_percentage: st === 'Completed' ? 100 : updatingTask.progress_percentage
                        })}
                        className={`p-2 rounded font-medium text-xs border ${
                          isSelected 
                            ? 'bg-violet-50 border-violet-600 text-violet-700 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Progress</label>
                  <span className="text-xs font-bold text-violet-700">{updatingTask.progress_percentage || 0}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={updatingTask.progress_percentage || 0}
                  onChange={e => setUpdatingTask({ ...updatingTask, progress_percentage: parseInt(e.target.value) })}
                  className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks</label>
                <textarea 
                  className="w-full p-2 border border-slate-200 rounded text-xs h-16 focus:border-violet-400 outline-none"
                  value={updatingTask.description || ''}
                  onChange={e => setUpdatingTask({ ...updatingTask, description: e.target.value })}
                  placeholder="What work did you do?"
                />
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await axios.put(`${API_BASE_URL}/tasks/${updatingTask.id}`, updatingTask);
                    alert("Task updated successfully!");
                    setUpdatingTask(null);
                    fetchTasks();
                  } catch (err) { alert("Failed to save progress"); }
                }}
                className="w-full py-2 bg-violet-700 text-white font-bold rounded text-sm hover:bg-violet-800 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
