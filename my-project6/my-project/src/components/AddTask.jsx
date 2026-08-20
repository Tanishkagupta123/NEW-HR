import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const SearchableSelect = ({ options, value, onChange, placeholder, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <div 
        className={`w-full p-3 border rounded-xl flex justify-between items-center bg-white cursor-pointer ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <span className="text-slate-400 text-xs">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input 
              type="text" 
              autoFocus
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
              placeholder="🔍 Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto p-1">
            <div 
              className="p-2 px-3 hover:bg-slate-100 rounded-lg cursor-pointer text-sm text-slate-500 italic"
              onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
            >
              Clear Selection
            </div>
            {filtered.map(opt => (
              <div 
                key={opt.value}
                className={`p-2 px-3 hover:bg-violet-50 rounded-lg cursor-pointer text-sm ${value === opt.value ? 'bg-violet-100 text-violet-900 font-bold' : 'text-slate-700'}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {opt.label}
              </div>
            ))}
            {filtered.length === 0 && <div className="p-3 text-center text-slate-400 text-sm">No results found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AddTask() {
  const { tasks, setTasks, handleTaskChange, addNewTaskBlock, submitAllTasks, employeesList, departments, removeTaskBlock } = useOutletContext();
  const [dateTime, setDateTime] = useState(new Date());
  const [assignMode, setAssignMode] = useState('single'); // 'single' or 'group'
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const [errors, setErrors] = useState({});
  const toggleGroupMember = (emp) => {
    setSelectedGroupMembers(prev => {
      const exists = prev.find(m => m.id === emp.id);
      if (exists) return prev.filter(m => m.id !== emp.id);
      return [...prev, emp];
    });
    setErrors(prev => ({ ...prev, group: null }));
  };

  const handleSubmitAll = () => {
    const newErrors = {};

    // 1. Department Validation
    if (tasks.some(t => !t.dept)) {
      newErrors.dept = "Please select a Department!";
    }

    if (assignMode === 'group') {
      // 2. Group Members Validation
      if (selectedGroupMembers.length === 0) {
        newErrors.group = "Please select at least one group member!";
      }
    } else {
      // 3. Single Employee Validation
      if (tasks.some(t => !t.assign_to)) {
        newErrors.single = "Please select an Employee!";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (assignMode === 'group') {
      const updatedTasks = tasks.map(t => ({
        ...t,
        assign_to: '', 
        group_member_ids: selectedGroupMembers.map(m => m.id),
        group_name: groupName || selectedGroupMembers.map(m => m.name).join(', ')
      }));
      submitAllTasks(updatedTasks);
    } else {
      const updatedTasks = tasks.map(t => ({
        ...t,
        group_member_ids: [],
        group_name: ''
      }));
      submitAllTasks(updatedTasks);
    }
  };

  const [memberSearch, setMemberSearch] = useState('');

  const filteredEmployees = employeesList ? employeesList.filter(emp => emp.name.toLowerCase().includes(memberSearch.toLowerCase()) || (emp.department && emp.department.toLowerCase().includes(memberSearch.toLowerCase()))) : [];

  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Task Reporting</h1>
        <div className="bg-violet-900 text-white px-4 py-2 rounded-xl font-mono text-sm md:text-xl shadow-lg">
          {dateTime.toLocaleDateString()} | {dateTime.toLocaleTimeString()}
        </div>
      </div>
      
      {/* Assignment Mode Toggle */}
      <div className="bg-white p-4 md:p-6 mb-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-bold text-slate-700">Assign To:</label>
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setAssignMode('single'); setSelectedGroupMembers([]); setMemberSearch(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                assignMode === 'single' ? 'bg-violet-900 text-white shadow' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Single Employee
            </button>
            <button
              type="button"
              onClick={() => setAssignMode('group')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                assignMode === 'group' ? 'bg-violet-900 text-white shadow' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Group (Multiple)
            </button>
          </div>
        </div>

        {assignMode === 'single' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Employee Name</label>
              <SearchableSelect 
                options={(employeesList || []).map(e => ({ label: e.name, value: e.name }))}
                value={tasks[0]?.assign_to || ''}
                onChange={(val) => {
                  setTasks(prev => prev.map(t => ({ ...t, assign_to: val })));
                  setErrors(prev => ({ ...prev, single: null }));
                }}
                placeholder="Select Employee..."
                error={!!errors.single}
              />
              {errors.single && <p className="text-red-500 text-xs mt-1 font-bold">{errors.single}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Department</label>
              <SearchableSelect 
                options={departments.map(d => ({ label: d, value: d }))}
                value={tasks[0]?.dept || ''}
                onChange={(val) => {
                  setTasks(prev => prev.map(t => ({ ...t, dept: val })));
                  setErrors(prev => ({ ...prev, dept: null }));
                }}
                placeholder="Select Dept..."
                error={!!errors.dept}
              />
              {errors.dept && <p className="text-red-500 text-xs mt-1 font-bold">{errors.dept}</p>}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Group Name (Optional)</label>
                <input
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-violet-500 outline-none"
                  placeholder="e.g. Project Alpha Team"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Search Employees</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="🔍 Search by name or department..."
                    className="w-full p-3 pr-10 border border-slate-200 rounded-xl outline-none focus:border-violet-500"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  {memberSearch && (
                    <button 
                      type="button"
                      onClick={() => setMemberSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="block text-sm font-semibold mb-2">
              Select Group Members 
              {errors.group && <span className="text-red-500 ml-2 text-xs">({errors.group})</span>}
            </label>
            
            <div className={`max-h-48 overflow-y-auto border rounded-xl p-3 bg-slate-50/50 space-y-1 ${errors.group ? 'border-red-400 bg-red-50/30' : 'border-slate-200'}`}>
              {filteredEmployees.map(emp => {
                const isSelected = selectedGroupMembers.some(m => m.id === emp.id);
                return (
                  <label key={emp.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition border border-transparent ${isSelected ? 'bg-white shadow-sm border-slate-200' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => toggleGroupMember(emp)} 
                      className="accent-violet-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-700">{emp.name}</span>
                    {emp.department && (
                      <span className="text-xs font-semibold text-slate-400 ml-2">({emp.department})</span>
                    )}
                  </label>
                );
              })}
              {errors.group && <p className="text-red-500 text-xs mt-2 font-bold">{errors.group}</p>}  
              {filteredEmployees.length === 0 && (
                <div className="text-center text-xs text-slate-500 py-4">No employees found.</div>
              )}
            </div>

            {selectedGroupMembers.length > 0 && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                  Selected ({selectedGroupMembers.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGroupMembers.map(m => (
                    <span key={m.id} className="inline-flex items-center gap-1 bg-violet-50 px-2 py-1 rounded text-[10px] font-bold text-violet-700 border border-violet-200">
                      {m.name}
                      <button
                        type="button"
                        onClick={() => toggleGroupMember(m)}
                        className="text-violet-400 hover:text-red-500 ml-1 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3">
              <label className="block text-sm font-semibold mb-2">Department</label>
              <select 
                className="w-full p-3 border rounded-xl" 
                onChange={(e) => tasks.forEach((_, i) => handleTaskChange(i, 'dept', e.target.value))}
              >
                <option value="">Select Dept</option>
                {departments && departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {tasks.map((task, index) => {
        const taskType = task.task_type || 'Self Task';
        const isClientTask = taskType === 'Client Task';

        return (
          <div key={index} className="bg-white p-4 md:p-6 mb-6 rounded-2xl shadow-sm border relative">
            {index > 0 && (
              <button 
                onClick={() => removeTaskBlock(index)} 
                className="absolute top-2 right-4 text-red-500 font-bold text-lg"
              >
                X
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Type</label>
                <select 
                  className="w-full p-3 border rounded-xl bg-slate-50 font-semibold"
                  value={taskType}
                  onChange={(e) => handleTaskChange(index, 'task_type', e.target.value)}
                >
                  <option value="Self Task">Self Task</option>
                  <option value="Client Task">Client Task</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task ID</label>
                <input 
                  className="w-full p-3 border rounded-xl bg-slate-100 font-mono text-slate-600 font-semibold cursor-not-allowed" 
                  value={task.id ? `TSK-${task.id}` : `TSK-AUTO-${index + 1}`} 
                  disabled 
                  readOnly
                />
              </div>

              {isClientTask ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client Name</label>
                  <input 
                    className="w-full p-3 border rounded-xl" 
                    placeholder="Enter Client Name" 
                    value={task.client_name || ''} 
                    onChange={(e) => handleTaskChange(index, 'client_name', e.target.value)} 
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                  <input 
                    className="w-full p-3 border rounded-xl" 
                    placeholder="Enter Task Title" 
                    value={task.title || ''} 
                    onChange={(e) => handleTaskChange(index, 'title', e.target.value)} 
                  />
                </div>
              )}
            </div>

            {isClientTask && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                  <input 
                    className="w-full p-3 border rounded-xl" 
                    placeholder="Enter Task Title" 
                    value={task.title || ''} 
                    onChange={(e) => handleTaskChange(index, 'title', e.target.value)} 
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 border rounded-xl" 
                  value={task.start_date || task.task_date || today} 
                  onChange={(e) => {
                    handleTaskChange(index, 'start_date', e.target.value);
                    handleTaskChange(index, 'task_date', e.target.value);
                  }} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 border rounded-xl" 
                  value={task.due_date || today} 
                  onChange={(e) => handleTaskChange(index, 'due_date', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select 
                  className="w-full p-3 border rounded-xl" 
                  value={task.status || 'Pending'}
                  onChange={(e) => handleTaskChange(index, 'status', e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                <select 
                  className="w-full p-3 border rounded-xl" 
                  value={task.priority || 'Normal'}
                  onChange={(e) => handleTaskChange(index, 'priority', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description / Remarks</label>
              <textarea 
                className="w-full p-3 border rounded-xl h-20" 
                placeholder="Task description..." 
                value={task.description || ''} 
                onChange={(e) => handleTaskChange(index, 'description', e.target.value)} 
              />
            </div>
          </div>
        );
      })}

      <div className="flex gap-2">
       
        <button 
          onClick={handleSubmitAll} 
          className="bg-violet-900 hover:bg-violet-800 text-white px-6 py-3 rounded-xl font-bold flex-1 md:flex-none transition-colors shadow-lg"
        >
          Submit All
        </button>
      </div>
    </div>
  );
}
