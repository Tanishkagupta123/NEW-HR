import { API_BASE_URL } from '../config/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [auth, setAuth] = useState({ identifier: '', password: '' });
  const [errorMessage, setErrorMessage] = useState(''); // 1. Message state add kiya
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Har naye attempt par message clear kar do

    if (!auth.identifier.trim()) {
      setErrorMessage('Please enter your admin name or employee email address.');
      return;
    }

    if (!auth.password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, auth);
      if (res.data.success) {
        const role = res.data.user?.role || 'employee';
        const token = res.data.token;
        
        // Store user and token
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (token) {
          localStorage.setItem('token', token);
          // Set token in axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        if (role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        setErrorMessage(res.data.message); // 2. Error aane par message dikhao
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Unable to connect to the server. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
    >
      <div className="w-full max-w-md rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:rounded-[36px] sm:p-8 md:max-w-lg md:p-10">
        
        <div className="mb-6 text-center sm:mb-8">
          <img src="/src/assets/ASGROUP-logo.webp" className="mx-auto h-16 w-16 rounded-full border-2 border-white/30 object-contain sm:h-20 sm:w-20" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-wide text-white sm:text-3xl">ASGROUP DIGITAL PVT LTD</h1>
          <p className="font-medium text-white/70">Secure Sign-In</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          {/* 3. Yahan error message dikhega */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 text-white text-center py-2 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Admin Name / Employee Email</label>
            <input 
              required
              className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder-white/50 outline-none transition focus:ring-2 focus:ring-violet-400 sm:px-6 sm:py-4"
              placeholder="Admin name or employee email"
              value={auth.identifier}
              onChange={(e) => setAuth({...auth, identifier: e.target.value})}
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Password</label>
            <input 
              type="password"
              required
              className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder-white/50 outline-none transition focus:ring-2 focus:ring-violet-400 sm:px-6 sm:py-4"
              placeholder="Enter your password"
              value={auth.password}
              onChange={(e) => setAuth({...auth, password: e.target.value})}
            />
          </div>

          <button className="w-full rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-violet-900/50 transition-all hover:from-violet-500 hover:to-indigo-500 sm:py-4">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
