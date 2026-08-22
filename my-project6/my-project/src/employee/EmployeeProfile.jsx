import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployeeProfile() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSalary, setShowSalary] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (loggedInUser.id) {
          const token = localStorage.getItem('token');
          const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
          const res = await axios.get(`${API_BASE_URL}/employees/${loggedInUser.id}`, config);
          if (res.data) {
            setUser({ ...loggedInUser, ...res.data });
          } else {
            setUser(loggedInUser);
          }
        } else {
          setUser(loggedInUser);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(loggedInUser);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  const getImageUrl = (p) => {
    if (!p) return null;
    try {
      if (p.startsWith('http')) return p;
      if (p.startsWith('/')) return `${API_BASE_URL}${p}`;
      return `${API_BASE_URL}/uploads/profiles/${p}`;
    } catch (e) {
      return p;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-slate-400 font-bold">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Determine user role type (TL vs Normal Employee)
  let roleBadge = 'Employee';
  let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
  
  const roleText = (user.role_position || '').toLowerCase();
  if (roleText.includes('tl') || roleText.includes('team lead') || roleText.includes('lead') || user.role === 'admin') {
    roleBadge = 'Team Leader';
    badgeColor = 'bg-amber-100 text-amber-700 border-amber-200';
  } else if (roleText) {
    roleBadge = 'Normal Employee';
    badgeColor = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-sm border border-slate-100">
        
        {/* Profile Header with Photo/Initial */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 border-b border-slate-100 pb-8 text-center sm:text-left">
          <div className="w-28 h-28 rounded-full bg-violet-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
            {user.profile_pic ? (
              <img src={getImageUrl(user.profile_pic)} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-violet-900">{getInitial(user.name)}</span>
            )}
          </div>
          <div className="flex-1 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
              <h2 className="text-3xl font-extrabold text-violet-950">{user.name || 'User'}</h2>
              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeColor}`}>
                {roleBadge}
              </span>
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{user.role_position || user.position || 'Employee'}</p>
          </div>
        </div>
        
        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Email Address</p>
            <p className="text-base font-bold text-slate-800 break-words">{user.email || 'N/A'}</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Phone Number</p>
            <p className="text-base font-bold text-slate-800">{user.phone_number || user.phone || 'N/A'}</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Employee ID</p>
            <p className="text-base font-bold text-slate-800">{user.employee_code || user.id || 'N/A'}</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Department</p>
            <p className="text-base font-bold text-slate-800">{user.department || 'N/A'}</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Designation</p>
            <p className="text-base font-bold text-slate-800">{user.position || user.role_position || 'N/A'}</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Joining Date</p>
            <p className="text-base font-bold text-slate-800">{formatDate(user.joining_date)}</p>
          </div>

          {/* Hidden Salary Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Monthly Salary (Confidential)</p>
              <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {showSalary ? `₹${user.monthly_salary || 0}` : '••••••••'}
              </p>
            </div>
            <button 
              onClick={() => setShowSalary(!showSalary)}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 transition-colors shadow-sm"
              title={showSalary ? "Hide Salary" : "Show Salary"}
            >
              {showSalary ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}