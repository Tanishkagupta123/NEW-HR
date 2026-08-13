import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export default function AllEmployees() {
  const { employeesList = [], fetchData } = useOutletContext();
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const addSkill = async (emp) => {
    const skill = prompt(`Add skill for ${emp.name}:`);
    if (!skill) return;
    try {
      await axios.put(`${API_BASE_URL}/employees/${emp.id}/skills`, { skill });
      if (typeof fetchData === 'function') fetchData();
      else alert('Skill added');
    } catch (err) {
      console.error(err);
      alert('Failed to add skill');
    }
  };

  const getSkills = (skills) => {
    if (!skills) return [];
    try { return JSON.parse(skills); }
    catch(e) { return (skills || '').split(',').map(s => s.trim()).filter(Boolean); }
  };

  const getProfileSrc = (pic) => {
    if (!pic) return null;
    if (pic.startsWith('http')) return pic;
    const cleaned = pic.replace(/^\/+/, '');
    if (cleaned.startsWith('uploads/')) return `${API_BASE_URL}/${cleaned}`;
    return `${API_BASE_URL}/uploads/${cleaned}`;
  };

  const filtered = employeesList.filter(emp =>
    (emp.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const displayed = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            All Employees Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} employees total</p>
        </div>

        {/* Search + Reset */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowAll(true); }}
            className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-2xl outline-none focus:border-violet-500 text-sm font-medium bg-slate-50 sm:w-64"
          />
          <button
            onClick={() => { setSearch(''); setShowAll(false); }}
            className="w-full px-4 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-2xl text-sm font-bold transition sm:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
              <th className="px-4 py-4 font-black rounded-tl-2xl">Emp Code</th>
              <th className="px-4 py-4 font-black">Profile</th>
              <th className="px-4 py-4 font-black">Name</th>
              <th className="px-4 py-4 font-black">Role</th>
              <th className="px-4 py-4 font-black">Role Position</th>
              <th className="px-4 py-4 font-black">Email</th>
              <th className="px-4 py-4 font-black">Phone</th>
              <th className="px-4 py-4 font-black">Department</th>
              <th className="px-4 py-4 font-black">Designation</th>
              <th className="px-4 py-4 font-black">Salary</th>
              <th className="px-4 py-4 font-black">Skills</th>
              <th className="px-4 py-4 font-black rounded-tr-2xl">Joining Date</th>
            </tr>
          </thead>

          <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-50">
            {displayed.length > 0 ? (
              displayed.map((emp) => {
                const skills = getSkills(emp.skills);
                const src = getProfileSrc(emp.profile_pic);
                return (
                  <tr key={emp.id} className="hover:bg-violet-50/30 transition">

                    {/* Emp Code */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                        {emp.employee_code || `EMP-${emp.id}`}
                      </span>
                    </td>

                    {/* Profile */}
                    <td className="px-4 py-4">
                      {src ? (
                        <img src={src} alt={emp.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-black text-violet-700">
                          {emp.name?.charAt(0)?.toUpperCase() || 'E'}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900 whitespace-nowrap">{emp.name || '—'}</p>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full whitespace-nowrap">
                        {emp.role || '—'}
                      </span>
                    </td>

                    {/* Role Position */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {emp.role_position || '—'}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4">
                      <p className="text-slate-600 text-xs whitespace-nowrap">{emp.email || '—'}</p>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4 whitespace-nowrap">{emp.phone_number || '—'}</td>

                    {/* Department */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full whitespace-nowrap">
                        {emp.department || '—'}
                      </span>
                    </td>

                    {/* Designation */}
                    <td className="px-4 py-4 whitespace-nowrap">{emp.designation || '—'}</td>

                    {/* Salary */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900 whitespace-nowrap">
                        {emp.monthly_salary != null ? `₹${Number(emp.monthly_salary).toLocaleString('en-IN')}` : '—'}
                      </p>
                    </td>

                    {/* Skills */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 items-center min-w-[120px]">
                        {skills.length > 0 ? skills.map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100 font-semibold whitespace-nowrap">
                            {s}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                        <button
                          onClick={() => addSkill(emp)}
                          className="text-[10px] px-2 py-0.5 bg-violet-900 text-white rounded-full font-bold hover:bg-violet-700 transition whitespace-nowrap"
                        >
                          + Add
                        </button>
                      </div>
                    </td>

                    {/* Joining Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500 text-xs">
                      {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN') : '—'}
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="13" className="py-16 text-center text-slate-400">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="font-bold">{search ? 'No employees found for this search.' : 'No employees onboarded yet.'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Show More / Less */}
      {filtered.length > 8 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-3 bg-violet-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition"
          >
            {showAll ? 'Show Less ▲' : `Show All ${filtered.length} Employees ▼`}
          </button>
        </div>
      )}

    </div>
  );
}
