import { API_BASE_URL } from '../config/api';
import { useOutletContext } from 'react-router-dom';
import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_COLORS = {
  'Pending': 'bg-slate-100 text-slate-700',
  'Interview Scheduled': 'bg-blue-100 text-blue-700',
  'Selected': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const LEVEL_COLORS = {
  'Junior': 'bg-yellow-100 text-yellow-800',
  'Mid-Level': 'bg-blue-100 text-blue-800',
  'Senior': 'bg-purple-100 text-purple-800',
};

export default function AdminHiring() {
  const { hiringList } = useOutletContext();
  const [hiringData, setHiringData] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [statusMessages, setStatusMessages] = useState({});

  useEffect(() => {
    setHiringData(hiringList || []);
  }, [hiringList]);

  const formatLocalDateTime = (dateTime) => {
    if (!dateTime) return '';
    return dateTime.toString().replace(' ', 'T').slice(0, 16);
  };

  const handleFieldChange = (id, field, value) => {
    setHiringData((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
    setStatusMessages((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSave = async (id, status, date) => {
    const requiresDate = status === 'Interview Scheduled' || status === 'Selected';
    if (requiresDate && !date) {
      alert('Please select an interview date and time before saving when status is Interview Scheduled or Selected.');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/hiring/update-status/${id}`, {
        status,
        interview_date: requiresDate ? date : null,
      });
      const emailSent = response?.data?.emailSent !== false;
      setHiringData((prev) => prev.map((item) => item.id === id ? { ...item, status, interview_date: requiresDate ? date : null } : item));
      setStatusMessages((prev) => ({
        ...prev,
        [id]: {
          text: requiresDate ? (emailSent ? 'Email sent' : 'Saved, email failed') : 'Saved',
          type: 'success'
        }
      }));
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.error || 'Update failed';
      setStatusMessages((prev) => ({
        ...prev,
        [id]: {
          text: errorMessage,
          type: 'error'
        }
      }));
      alert(errorMessage);
    }
  };

  const parseSkills = (skillsStr) => {
    if (!skillsStr) return [];
    try {
      const parsed = JSON.parse(skillsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="mb-4 text-2xl font-black text-violet-950 sm:mb-6">Job Applications</h2>

      <div className="space-y-4 lg:hidden">
        {hiringData && hiringData.length > 0 ? (
          hiringData.map((app) => {
            const skills = parseSkills(app.extracted_skills);
            return (
              <div key={app.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-violet-950">{app.name}</h3>
                      <p className="text-sm text-slate-500">{app.email}</p>
                      <p className="text-sm text-slate-600 mt-1">{app.phone} · {app.position}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[app.status] || 'bg-slate-100 text-slate-700'}`}>
                      {app.status || 'Pending'}
                    </span>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</label>
                      <select
                        value={app.status || 'Pending'}
                        onChange={(e) => handleFieldChange(app.id, 'status', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {(app.status === 'Interview Scheduled' || app.status === 'Selected') && (
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Interview date</label>
                        <input
                          type="datetime-local"
                          value={formatLocalDateTime(app.interview_date)}
                          onChange={(e) => handleFieldChange(app.id, 'interview_date', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleSave(app.id, app.status || 'Pending', app.interview_date)}
                      className="w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                    >
                      Save
                    </button>
                  </div>

                  <div className="grid gap-2 rounded-3xl bg-slate-50 p-3 text-sm text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">AI Level:</span> {app.extracted_level || 'Not scanned'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Experience:</span> {app.extracted_experience !== null && app.extracted_experience !== undefined ? `${app.extracted_experience} yrs` : '—'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Resume:</span> {app.resume ? (<a className="text-violet-700 hover:underline" href={`${API_BASE_URL}/uploads/${app.resume}`} target="_blank" rel="noreferrer">View</a>) : 'No file'}
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span key={index} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="font-semibold text-slate-700">Cover Message</p>
                    <p>{app.message || 'No message provided.'}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">No applications received yet.</div>
        )}
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-violet-700 font-bold">Name</th>
              <th className="p-4 text-violet-700 font-bold">Contact</th>
              <th className="p-4 text-violet-700 font-bold">Position</th>
              <th className="p-4 text-violet-700 font-bold">Resume</th>
              <th className="p-4 text-violet-700 font-bold">AI Level</th>
              <th className="p-4 text-violet-700 font-bold">Experience</th>
              <th className="p-4 text-violet-700 font-bold">Status</th>
              <th className="p-4 text-violet-700 font-bold">Interview</th>
              <th className="p-4 text-violet-700 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {hiringData && hiringData.length > 0 ? (
              hiringData.map((app) => {
                const skills = parseSkills(app.extracted_skills);
                const isExpanded = expandedId === app.id;
                return (
                  <Fragment key={app.id}>
                    <tr key={`${app.id}-main`} className="border-b hover:bg-slate-50 transition">
                      <td className="p-4">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : app.id)}
                          className="font-bold text-left text-violet-950 hover:text-violet-600 flex items-center gap-1"
                        >
                          {app.name}
                          <span className="text-xs text-slate-400">{isExpanded ? '▲' : '▼'}</span>
                        </button>
                        {app.extracted_name && app.extracted_name !== app.name && (
                          <p className="text-xs text-slate-400 mt-0.5">AI: {app.extracted_name}</p>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        <p>{app.phone}</p>
                        <p className="text-slate-500">{app.email}</p>
                      </td>
                      <td className="p-4 text-violet-800 font-semibold">{app.position}</td>
                      <td className="p-4">
                        {app.resume ? (
                          <a href={`${API_BASE_URL}/uploads/${app.resume}`} target="_blank" rel="noopener noreferrer" className="bg-violet-100 text-violet-900 px-3 py-1 rounded-lg font-bold hover:bg-violet-200 transition text-sm">View</a>
                        ) : <span className="text-slate-400">No File</span>}
                      </td>
                      <td className="p-4">
                        {app.extracted_level ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${LEVEL_COLORS[app.extracted_level] || 'bg-slate-100 text-slate-700'}`}>
                            {app.extracted_level}
                          </span>
                        ) : <span className="text-slate-400 text-xs">Not scanned</span>}
                      </td>
                      <td className="p-4 text-sm font-semibold">
                        {app.extracted_experience !== null && app.extracted_experience !== undefined
                          ? `${app.extracted_experience} yrs`
                          : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="p-4">
                        <select
                          value={app.status || 'Pending'}
                          onChange={(e) => handleFieldChange(app.id, 'status', e.target.value)}
                          className={`border p-1.5 rounded-lg text-xs font-semibold ${STATUS_COLORS[app.status] || 'bg-slate-100'}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {(app.status === 'Interview Scheduled' || app.status === 'Selected') ? (
                          <input
                            type="datetime-local"
                            value={formatLocalDateTime(app.interview_date)}
                            onChange={(e) => handleFieldChange(app.id, 'interview_date', e.target.value)}
                            className="border p-1.5 rounded-lg text-xs"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs">Not required</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleSave(app.id, app.status || 'Pending', app.interview_date)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition"
                          >
                            Save
                          </button>
                          {statusMessages[app.id] && (
                            <span className={`inline-flex items-center gap-1 text-[11px] ${statusMessages[app.id].type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                              {statusMessages[app.id].type === 'success' ? '✓' : '⚠'} {statusMessages[app.id].text}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${app.id}-details`} className="bg-violet-50/50 border-b">
                        <td colSpan="9" className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">Cover Message</p>
                              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-violet-100">
                                {app.message || <span className="text-slate-400">No message provided</span>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">AI-Extracted Skills</p>
                              {skills.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {skills.map((s, i) => (
                                    <span key={`${app.id}-skill-${i}`} className="bg-white border border-violet-200 text-violet-800 px-2 py-1 rounded-lg text-xs font-medium">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              ) : <p className="text-sm text-slate-400">No skills extracted yet</p>}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">Education</p>
                              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-violet-100">
                                {app.extracted_education || <span className="text-slate-400">Not available</span>}
                              </p>
                            </div>
                            <div className="md:col-span-3">
                              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">AI Summary</p>
                              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-violet-100">
                                {app.extracted_summary || <span className="text-slate-400">Not available</span>}
                              </p>
                            </div>
                            <div className="md:col-span-3">
                              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">Experience Details</p>
                              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-violet-100">
                                {app.extracted_experience_details || <span className="text-slate-400">Not available</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="p-10 text-center text-slate-500">No applications received yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}