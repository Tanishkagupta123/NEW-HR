import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  };
  const blankTask = () => ({ client_name: '', title: '', task_date: getLocalDate(), hours: 0, minutes: 0, status: 'Pending', priority: 'Normal', description: '' });
  const [newTask, setNewTask] = useState(blankTask);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/tasks`);
      const allTasks = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
      const myTasks = allTasks.filter(t => {
        const assigned = String(t.assign_to || "").toLowerCase().trim();
        const userName = String(user.name || "").toLowerCase().trim();
        const userId = String(user.id || "").toLowerCase().trim();
        return assigned === userId || assigned === userName;
      });
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
        priority: newTask.priority
      });
      alert("Task self-assigned successfully!");
      setNewTask(blankTask());
      setShowForm(false);
      fetchTasks();
    } catch (err) { alert("Failed to assign task"); }
  };

  const today = getLocalDate();
  const startOfToday = new Date(`${today}T00:00:00`);
  const withinNextWeek = new Date(startOfToday);
  withinNextWeek.setDate(withinNextWeek.getDate() + 7);
  // Backend DATE values arrive in UTC; convert them to the employee's local calendar date.
  const toLocalDateKey = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000)).toISOString().slice(0, 10);
  };
  const taskDateKey = (task) => toLocalDateKey(task.task_date || task.created_at);
  const dateOf = (task) => {
    const key = taskDateKey(task);
    return key ? new Date(`${key}T00:00:00`) : null;
  };
  const todayTasks = tasks.filter(task => taskDateKey(task) === today);
  const weekTasks = tasks.filter(task => {
    const date = dateOf(task);
    return date && taskDateKey(task) !== today && date > startOfToday && date <= withinNextWeek;
  });
  const otherTasks = tasks.filter(task => !todayTasks.includes(task) && !weekTasks.includes(task));

  const TaskGroup = ({ title, items, emptyText }) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">{title}</h3>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-400">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t.client_name || 'General task'} · {taskDateKey(t) || 'No date'}</p>
                  <h4 className="mt-1 text-lg font-black text-violet-950">{t.title}</h4>
                </div>
                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-[10px] font-black uppercase">{t.status || 'Pending'}</span>
              </div>
              {t.description && <p className="text-slate-600 mt-2 text-sm">{t.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-[32px] shadow-sm border border-slate-100 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <h2 className="text-3xl font-extrabold text-violet-950">My Tasks</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-violet-900 text-white rounded-2xl font-black hover:bg-black transition"
        >
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSelfAssign} className="p-6 bg-violet-50 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input value={user.name || 'Current employee'} readOnly className="w-full p-3 rounded-xl border bg-slate-100 text-slate-500" />
            <input value={user.department || 'Current department'} readOnly className="w-full p-3 rounded-xl border bg-slate-100 text-slate-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input placeholder="Client Name" value={newTask.client_name} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, client_name: e.target.value})} required />
            <input placeholder="Task Title" value={newTask.title} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, title: e.target.value})} required />
            <input type="date" value={newTask.task_date} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, task_date: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <input type="number" min="0" max="23" placeholder="Hours" value={newTask.hours || ''} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, hours: e.target.value})} />
            <input type="number" min="0" max="59" placeholder="Mins" value={newTask.minutes || ''} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, minutes: e.target.value})} />
            <select value={newTask.status} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, status: e.target.value})}><option>Pending</option><option>Completed</option></select>
            <select value={newTask.priority} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, priority: e.target.value})}><option>Normal</option><option>High</option></select>
          </div>
          <textarea placeholder="Description..." value={newTask.description} className="w-full p-3 rounded-xl border" onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
          <button type="submit" className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold">Add Task for Myself</button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-400 font-bold">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10"><p className="text-slate-400 font-bold">No tasks assigned yet.</p></div>
      ) : (
        <div className="space-y-8">
          <TaskGroup title="Today's Tasks" items={todayTasks} emptyText="No tasks due today." />
          <TaskGroup title="This Week" items={weekTasks} emptyText="No tasks scheduled for this week." />
          <TaskGroup title="Other Tasks" items={otherTasks} emptyText="No other tasks in your list." />
        </div>
      )}
    </div>
  );
}
