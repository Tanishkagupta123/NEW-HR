import { API_BASE_URL } from '../config/api';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/as group logo.webp';

// Clean SVG Icons
const icons = {
  addEmployee: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>),
  allEmployees: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
  attendance: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
  leaveManagement: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  payroll: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  payslip: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
  performance: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>),
  communication: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>),
  team: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
  task: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
  addTask: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  dataTasks: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>),
  recruitment: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
  training: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>),
  certificate: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 5 5 0 01-10 0z" /></svg>),
  default: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></svg>),
};

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tasksList, setTasksList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [hiringList, setHiringList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  };

  const createBlankTask = () => ({ assign_to: '', dept: '', client_name: '', title: '', task_date: getLocalDate(), hours: 0, minutes: 0, status: 'Pending', priority: 'Normal', description: '' });
  const [tasks, setTasks] = useState(() => [createBlankTask()]);
  const [employee, setEmployee] = useState({ name: '', password: '', department: '', position: 'Employee', monthly_salary: '', email: '', phone: '', designation: '', joining_date: '', role: 'employee', role_position: '' });
  const [departments, setDepartments] = useState(() => JSON.parse(localStorage.getItem('companyDepartments')) || ['IT', 'HR', 'Sales']);

  useEffect(() => { localStorage.setItem('companyDepartments', JSON.stringify(departments)); }, [departments]);

  const fetchData = async () => {
    try {
      const tRes = await axios.get(`${API_BASE_URL}/tasks`);
      const eRes = await axios.get(`${API_BASE_URL}/employees`);
      setTasksList(tRes.data);
      setEmployeesList(eRes.data);
      const hRes = await axios.get(`${API_BASE_URL}/hiring/all`);
      setHiringList(hRes.data);
    } catch (err) { console.error("Error fetching data"); }
  };

  useEffect(() => { fetchData(); }, []);

  const addDepartment = () => {
    const newDept = prompt("Enter new department name:");
    if (newDept && !departments.includes(newDept)) {
      setDepartments([...departments, newDept]);
    } else if (departments.includes(newDept)) {
      alert("This department already exists!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  };

  const handleOnboard = async () => {
    if (!employee.name.trim() || !employee.email.trim() || !employee.department || !employee.monthly_salary) {
      alert("Please Name, Email, Department aur Monthly Salary zaroor bharein!");
      return;
    }
    if (Number(employee.monthly_salary) <= 0) {
      alert("Monthly Salary valid number hona chahiye.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', employee.name || '');
      formData.append('email', employee.email || '');
      formData.append('phone', employee.phone || '');
      formData.append('phone_number', employee.phone || '');
      formData.append('password', employee.password || '');
      formData.append('department', employee.department || '');
      formData.append('designation', employee.designation || '');
      formData.append('monthly_salary', Number(employee.monthly_salary));
      formData.append('role', employee.role || 'employee');
      formData.append('role_position', employee.role_position || '');
      formData.append('joining_date', employee.joining_date || '');
      formData.append('position', employee.position || 'Employee');

      if (employee.profile_pic instanceof File) formData.append('profile_pic', employee.profile_pic);
      if (employee.aadhaar_file instanceof File) formData.append('aadhaar_file', employee.aadhaar_file);
      if (employee.pan_file instanceof File) formData.append('pan_file', employee.pan_file);
      if (employee.certificate_file instanceof File) formData.append('certificate_file', employee.certificate_file);

      await axios.post(`${API_BASE_URL}/employees`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Employee Successfully Onboarded!");
      setEmployee({ name: '', password: '', department: '', position: 'Employee', monthly_salary: '', email: '', phone: '', designation: '', joining_date: '', role: 'employee', role_position: '' });
      fetchData();
      navigate('/admin/all-employees');
    } catch (err) {
      if (err.response?.data?.message) {
        alert('Error: ' + err.response.data.message);
      } else {
        alert("Error! Check console.");
      }
      console.error(err);
    }
  };

  const handleTaskChange = (i, field, val) => {
    const newTasks = [...tasks];
    newTasks[i][field] = val;
    setTasks(newTasks);
  };

  const submitAllTasks = async () => {
    if (tasks.some(t => !t.client_name || !t.title)) {
      alert("Please Project Name aur Title bharein!");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/tasks`, tasks);
      alert("Tasks Successfully Submitted!");
      setTasks([createBlankTask()]);
      fetchData();
    } catch (err) { alert("Submit nahi hua!"); }
  };

  const menuItems = [
    { name: 'Add Employee', path: '/admin/add-employee', icon: 'addEmployee' },
    { name: 'All Employees', path: '/admin/all-employees', icon: 'allEmployees' },
    { name: 'Attendance', path: '/admin/attendance', icon: 'attendance' },
    { name: 'Leave Management', path: '/admin/leave-management', icon: 'leaveManagement' },
    { name: 'Payroll Management', path: '/admin/payroll-management1', icon: 'payroll' },
    { name: 'Payslip Generation', path: '/admin/payslip-generation', icon: 'payslip' },
    { name: 'Performance Management', path: '/admin/performance-management', icon: 'performance' },
    { name: 'Communication System', path: '/admin/communication-system', icon: 'communication' },
    { name: 'Team Collaboration', path: '/admin/team-collaboration', icon: 'team' },
    { name: 'Task & Workflow', path: '/admin/task-workflow-management', icon: 'task' },
    { name: 'Add Task', path: '/admin/add-task', icon: 'addTask' },
    { name: 'Data of Tasks', path: '/admin/data-tasks', icon: 'dataTasks' },
    { name: 'Certificate Management', path: '/admin/certificate-management', icon: 'certificate' },
    { name: 'Employee Documents', path: '/admin/employee-documents', icon: 'default' },
    { name: 'Recruitment', path: '/admin/hiring', icon: 'recruitment', children: [
      { name: 'Training', path: '/admin/hiring/training', icon: 'training' }
    ] }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 font-sans md:flex-row">
      <div className={`fixed inset-0 z-30 bg-black/30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform border-r border-slate-100 bg-white shadow-sm transition-transform duration-300 md:fixed md:h-screen md:w-72 md:translate-x-0 md:shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between gap-3.5 p-6 border-b border-slate-100">
            <Link to="/admin" className="flex items-center gap-3.5" onClick={() => setIsSidebarOpen(false)}>
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain rounded-xl shadow-sm border border-slate-100" />
              <div>
                <h1 className="font-extrabold text-xl text-violet-950 tracking-tight leading-none">AS GROUP DIGITAL PVT LTD</h1>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Admin Panel</span>
              </div>
            </Link>
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-6 flex flex-col gap-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            {menuItems.map((item) => {
              const isParentActive = location.pathname === item.path || (item.path && location.pathname.startsWith(item.path + '/'));

              if (item.children) {
                return (
                  <div key={item.name} className="flex flex-col gap-1">
                    {item.path ? (
                      <Link to={item.path} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isParentActive ? 'bg-violet-600 text-white shadow-sm shadow-violet-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <span className={isParentActive ? 'text-white' : 'text-slate-400'}>{icons[item.icon] || icons.default}</span>
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50">
                        <span className="text-slate-400">{icons[item.icon] || icons.default}</span>
                        <span>{item.name}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 pl-4 ml-6 border-l border-slate-100 mt-1 mb-2">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <Link key={child.path} to={child.path} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${isChildActive ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <span className={isChildActive ? 'text-violet-700' : 'text-slate-400'}>{icons[child.icon] || icons.default}</span>
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-violet-600 text-white shadow-sm shadow-violet-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{icons[item.icon] || icons.default}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-white">
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition border border-red-50 hover:border-red-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen w-full overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:ml-72 lg:px-6 lg:py-6 xl:px-8 xl:py-8">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setIsSidebarOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <img src={logo} alt="AS GROUP DIGITAL PVT LTD" className="h-10 w-10 rounded-xl border border-slate-200 object-contain" />
            <div>
              <p className="text-sm font-bold text-violet-950">AS GROUP DIGITAL PVT LTD</p>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>
        </div>
        <Outlet context={{ tasksList, employeesList, tasks, setTasks, employee, setEmployee, departments, setDepartments, addDepartment, fetchData, handleOnboard, handleTaskChange, submitAllTasks, hiringList }} />
      </main>
    </div>
  );
}
