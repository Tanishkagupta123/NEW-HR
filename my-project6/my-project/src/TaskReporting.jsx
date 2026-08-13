import { API_BASE_URL } from './config/api';
import { useState } from 'react';
import axios from 'axios';

export default function TaskReporting() {
  const [task, setTask] = useState({ 
    empName: 'Ankit Prajapati', dept: 'Developer Team', // Ye hardcoded values hain
    client: '', title: '', date: '', hrs: '', mins: '', status: 'Pending', priority: 'Normal', description: '' 
  });

  const submitTask = async () => {
    try {
      await axios.post(`${API_BASE_URL}/tasks`, task);
      alert("Task Submitted Successfully!");
      setTask({ ...task, client: '', title: '', date: '', hrs: '', mins: '', description: '' });
    } catch (err) {
      alert("Error saving task.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Task Reporting</h1>
        </div>

        {/* Name aur Department field (Screenshot jaisa) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input className="p-4 border bg-slate-100 rounded-2xl cursor-not-allowed" value={task.empName} disabled />
          <input className="p-4 border bg-slate-100 rounded-2xl cursor-not-allowed" value={task.dept} disabled />
        </div>

        {/* Project, Title, Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <input className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-violet-500" placeholder="Project Name" onChange={(e) => setTask({...task, client: e.target.value})} />
          <input className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-violet-500" placeholder="Task Title" onChange={(e) => setTask({...task, title: e.target.value})} />
          <input type="date" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-violet-500" onChange={(e) => setTask({...task, date: e.target.value})} />
        </div>

        {/* Hrs, Mins, Status, Priority */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <input type="number" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-violet-500" placeholder="Hrs" onChange={(e) => setTask({...task, hrs: e.target.value})} />
          <input type="number" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-violet-500" placeholder="Mins" onChange={(e) => setTask({...task, mins: e.target.value})} />
          <select className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-violet-500" onChange={(e) => setTask({...task, status: e.target.value})}>
            <option>Pending</option><option>Completed</option>
          </select>
          <select className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-violet-500" onChange={(e) => setTask({...task, priority: e.target.value})}>
            <option>Normal</option><option>High</option>
          </select>
        </div>

        {/* Description */}
        <textarea 
          className="w-full p-4 border rounded-2xl mb-8 outline-none focus:ring-2 focus:ring-violet-500 h-32" 
          placeholder="What did you do today?" 
          onChange={(e) => setTask({...task, description: e.target.value})} 
        />

        <button onClick={submitTask} 
          className="w-full md:w-auto bg-violet-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-violet-800 transition-all shadow-xl shadow-violet-200">
          + Add Another Task
        </button>
      </div>
    </div>
  );
}

