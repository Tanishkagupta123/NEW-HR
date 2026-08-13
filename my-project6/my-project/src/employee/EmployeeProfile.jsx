import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployeeProfile() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (loggedInUser.id) {
          const token = localStorage.getItem('token');
          const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
          const res = await axios.get(`${API_BASE_URL}/employees/${loggedInUser.id}`, config);
          if (res.data) {
            // Merge API response (which has all fields) with logged-in user data
            setUser({ ...loggedInUser, ...res.data });
          } else {
            // If API returns null, fall back to localStorage user
            setUser(loggedInUser);
          }
        } else {
          setUser(loggedInUser);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // On error, use localStorage user
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(loggedInUser);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Function to get initial letter
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  // Resolve profile image URL to backend when needed
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-slate-400 font-bold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
        
        {/* Profile Header with Photo/Initial */}
        <div className="flex items-center gap-6 mb-10 border-b border-slate-100 pb-8">
          <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            {user.profile_pic ? (
              <img src={getImageUrl(user.profile_pic)} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-violet-900">{getInitial(user.name)}</span>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-violet-950">{user.name || 'User'}</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{user.role_position || user.position || 'Employee'}</p>
          </div>
        </div>
        
        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {[
            { label: 'Email Address', value: user.email },
            { label: 'Phone Number', value: user.phone_number || user.phone },
            { label: 'Department', value: user.department },
            { label: 'Designation', value: user.role_position || user.position },
            { label: 'Joining Date', value: user.joining_date },
            { label: 'Employee ID', value: user.employee_code || user.id }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{item.label}</p>
              <p className="text-lg font-bold text-slate-800">{item.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}