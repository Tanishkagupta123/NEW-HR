import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/ASGROUP-logo.webp';

/* --------------------------------------------------------------
   SVG icon collection – same set used in the Admin dashboard
   -------------------------------------------------------------- */
const icons = {
  myProfile: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
  myTasks: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  communication: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  applyLeave: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 8v4l3 3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ),
  attendance: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  employeeDocuments: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  hrChatbot: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  default: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    </svg>
  )
};

/* --------------------------------------------------------------
   Component
   -------------------------------------------------------------- */
export default function EmployeeDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'My Profile', path: '/dashboard', icon: icons.myProfile },
    { name: 'My Tasks', path: '/dashboard/tasks', icon: icons.myTasks },
    { name: 'Communication System', path: '/dashboard/communication-system', icon: icons.communication },
    { name: 'Apply Leave', path: '/dashboard/apply-leave', icon: icons.applyLeave },
    { name: 'Attendance', path: '/dashboard/attendance', icon: icons.attendance },
    { name: 'Employee Training', path: '/dashboard/employee-training', icon: icons.employeeDocuments },
    {
      name: 'HR Chatbot System',
      path: '/dashboard/system',
      icon: icons.hrChatbot,
      children: []   // placeholder for future sub‑menus
    }
  ];

  const renderMenuItem = (item, level = 0) => {
    const isActive = location.pathname === item.path;
    const padLeft = `${level * 12 + 16}px`;

    return (
      <div key={item.path || item.name} className="flex flex-col">
        <Link
          to={item.path}
          onClick={() => setIsSidebarOpen(false)}
          style={{ paddingLeft: padLeft }}
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
            transition-colors duration-200
            ${isActive
              ? 'bg-violet-600 text-white shadow-sm shadow-violet-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
          `}
        >
          <span className={isActive ? 'text-white' : 'text-slate-400'}>
            {item.icon || icons.default}
          </span>
          <span>{item.name}</span>
        </Link>

        {/* Render any nested children (if you ever add them) */}
        {item.children && item.children.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 font-sans md:flex-row">
      <div className={`fixed inset-0 z-30 bg-black/30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)} />

      {/* -------------------- SIDEBAR -------------------- */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 max-w-[85vw] flex-col transform border-r border-slate-100 bg-white shadow-sm transition-transform duration-300 md:fixed md:h-screen md:w-72 md:shrink-0 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header + Nav (scrollable) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* LOGO / TITLE */}
          <div className="flex items-center justify-between gap-3.5 p-6 border-b border-slate-50">
            <div className="flex min-w-0 items-center gap-3.5">
              <img src={logo} alt="Logo"
                   className="w-12 h-12 shrink-0 object-contain rounded-xl shadow-sm border border-slate-100" />
              <div>
                <h1 className="font-extrabold text-xl text-violet-950 tracking-tight">ASGROUP DIGITAL PVT LTD</h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Employee Portal</span>
              </div>
            </div>
            <button type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl leading-none text-slate-500 hover:bg-slate-50 md:hidden">×</button>
          </div>

          {/* MENU LIST */}
          <nav className={`
            flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1.5
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-slate-200
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-300
          `}>
            {menuItems.map(item => renderMenuItem(item))}

            {/* “Open Chat” CTA – same style as admin dashboard */}
            <div className="mt-6 p-5 rounded-2xl bg-violet-50/70 border border-violet-100/50 text-center">
              <p className="text-[11px] text-slate-500 font-semibold mb-3">
                Connect with your teammates
              </p>
              <Link
                to="/dashboard/team-collaboration"
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  inline-flex items-center justify-center gap-2 w-full
                  px-4 py-2.5 bg-violet-950 hover:bg-violet-900 text-white
                  rounded-xl font-bold text-xs transition-colors
                  shadow-sm
                `}
              >
                Open Chat
              </Link>
            </div>
          </nav>
        </div>

        {/* LOGOUT BUTTON – sticky at bottom */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className={`
              flex items-center justify-center gap-2 w-full
              px-4 py-3 rounded-xl text-sm font-semibold
              text-red-600 hover:bg-red-50 hover:text-red-700
              transition-colors duration-200 border border-red-50
              hover:border-red-100
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* -------------------- MAIN CONTENT -------------------- */}
      <main className="flex-1 min-h-screen w-full min-w-0 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:ml-72 lg:px-6 lg:py-6 xl:px-8 xl:py-8">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setIsSidebarOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-50">☰</button>
          <div className="flex items-center gap-3">
            <img src={logo} alt="ASGROUP DIGITAL PVT LTD" className="h-10 w-10 rounded-xl border border-slate-200 object-contain" />
            <div><p className="text-sm font-bold text-violet-950">ASGROUP DIGITAL PVT LTD</p><p className="text-xs text-slate-500">Employee Portal</p></div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

