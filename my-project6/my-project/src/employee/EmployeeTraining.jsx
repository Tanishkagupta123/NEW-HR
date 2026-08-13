import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeeTraining() {
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentEmployeeId = loggedInUser?.id;
  const currentEmployeeName = loggedInUser?.name || '';

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const visibleEmployees = employees.filter(emp => String(emp.id) === String(currentEmployeeId));
  const filtered = visibleEmployees.filter(e => e.name && e.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  const addSkill = async (emp) => {
    const skill = prompt(`Add skill for ${emp.name}:`);
    if (!skill) return;
    try {
      await axios.put(`${API_BASE_URL}/employees/${emp.id}/skills`, { skill });
      await fetchEmployees();
      if (selected && selected.id === emp.id) setSelected({ ...emp, skills: JSON.stringify([...(JSON.parse(emp.skills || '[]') || []), skill]) });
      alert('Skill added');
    } catch (err) {
      console.error(err);
      alert('Failed to add skill');
    }
  };

  // sample static course assignment rows (now stateful so modal can add rows)
  const [courses, setCourses] = useState([
    { id: 1, employee: 'Rahul', course: 'React JS', duration: '30 Days', progress: 80 },
    { id: 2, employee: 'Anjali', course: 'HR Policy', duration: '15 Days', progress: 45 },
    { id: 3, employee: 'Mohit', course: 'Excel', duration: '20 Days', progress: 100 }
  ]);

  const [trainings, setTrainings] = useState([
    { id: 1, employee: 'Rahul Sharma', training: 'React Basics', trainer: 'Amit', date: '10 Jul', status: 'Completed' },
    { id: 2, employee: 'Anjali Verma', training: 'Communication', trainer: 'Neha', date: '15 Jul', status: 'Ongoing' },
    { id: 3, employee: 'Mohit Singh', training: 'Leadership', trainer: 'Raj', date: '20 Jul', status: 'Pending' }
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: '', training: '', trainer: '', startDate: '', endDate: '', status: 'Completed' });

  // Assign Course modal
  const [showAssignCourse, setShowAssignCourse] = useState(false);
  const [assignForm, setAssignForm] = useState({ employeeId: '', course: '', duration: '30 Days', progress: 0 });

  const openAssignCourse = () => {
    setAssignForm({ employeeId: '', course: '', duration: '30 Days', progress: 0 });
    setShowAssignCourse(true);
  };

  const saveAssignCourse = () => {
    const emp = employees.find(e => String(e.id) === String(assignForm.employeeId));
    const entry = {
      id: Date.now(),
      employee: emp ? emp.name : (assignForm.employeeId || '—'),
      course: assignForm.course,
      duration: assignForm.duration,
      progress: Number(assignForm.progress || 0)
    };
    setCourses([entry, ...courses]);
    setShowAssignCourse(false);
  };

  // Add Skill modal state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({ employeeId: '', skill: '', level: 'Intermediate' });

  // Certification records
  const [certs, setCerts] = useState([
    { id: 1, employee: 'Rahul Sharma', certificate: 'AWS Cloud', issued: '10 Jan', expiry: '10 Jan 2028', status: 'Valid', file: null }
  ]);
  const [showAddCert, setShowAddCert] = useState(false);
  const [certForm, setCertForm] = useState({ employeeId: '', certificate: '', issued: '', expiry: '', status: 'Valid', file: null });

  const visibleTrainings = trainings.filter(t =>
    String(t.employeeId || '').toLowerCase() === String(currentEmployeeId).toLowerCase() ||
    String(t.employee || '').toLowerCase() === String(currentEmployeeName).toLowerCase()
  );
  const visibleCourses = courses.filter(c =>
    String(c.employeeId || '').toLowerCase() === String(currentEmployeeId).toLowerCase() ||
    String(c.employee || '').toLowerCase() === String(currentEmployeeName).toLowerCase()
  );
  const visibleCerts = certs.filter(c =>
    String(c.employeeId || '').toLowerCase() === String(currentEmployeeId).toLowerCase() ||
    String(c.employee || '').toLowerCase() === String(currentEmployeeName).toLowerCase()
  );

  useEffect(() => {
    if (!selected && visibleEmployees.length > 0) {
      setSelected(visibleEmployees[0]);
    }
  }, [visibleEmployees, selected]);

  const openAdd = () => {
    setForm({ employeeId: '', training: '', trainer: '', startDate: '', endDate: '', status: 'Completed' });
    setShowAdd(true);
  };

  const saveTraining = () => {
    const emp = employees.find(e => String(e.id) === String(form.employeeId));
    const entry = {
      id: Date.now(),
      employee: emp ? emp.name : form.employeeId,
      training: form.training,
      trainer: form.trainer,
      date: form.startDate || '',
      status: form.status || 'Pending'
    };
    setTrainings([entry, ...trainings]);
    setShowAdd(false);
  };

  const openAddSkill = () => {
    setSkillForm({ employeeId: '', skill: '', level: 'Intermediate' });
    setShowAddSkill(true);
  };

  const saveSkillFromModal = async () => {
    if (!skillForm.employeeId || !skillForm.skill) {
      alert('Select employee and enter skill');
      return;
    }
    const emp = employees.find(e=>String(e.id)===String(skillForm.employeeId));
    const combined = `${skillForm.skill} (${skillForm.level})`;
    try {
      await axios.put(`${API_BASE_URL}/employees/${skillForm.employeeId}/skills`, { skill: combined });
      await fetchEmployees();
      setShowAddSkill(false);
      alert('Skill added');
    } catch (err) {
      console.error(err);
      alert('Failed to add skill');
    }
  };

  const openAddCert = () => {
    setCertForm({ employeeId: '', certificate: '', issued: '', expiry: '', status: 'Valid', file: null });
    setShowAddCert(true);
  };

  const saveCert = () => {
    const emp = employees.find(e=>String(e.id)===String(certForm.employeeId));
    const entry = {
      id: Date.now(),
      employee: emp ? emp.name : certForm.employeeId,
      certificate: certForm.certificate,
      issued: certForm.issued,
      expiry: certForm.expiry,
      status: certForm.status,
      file: certForm.file ? URL.createObjectURL(certForm.file) : null
    };
    setCerts([entry, ...certs]);
    setShowAddCert(false);
  };

  const ProgressBar = ({ p }) => (
    <div className="w-full bg-slate-100 rounded-full h-3">
      <div style={{ width: `${p}%` }} className="h-3 rounded-full bg-violet-900" />
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-black text-violet-950 mb-4">1. Employee Training</h2>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Employee" className="w-full px-4 py-3 border rounded-xl sm:w-auto" />
            <button onClick={() => setSearch('')} className="w-full px-4 py-3 bg-slate-100 rounded-xl sm:w-auto">Clear</button>
          </div>
          <div>
            <button onClick={openAdd} className="w-full px-4 py-2 bg-violet-900 text-white rounded-xl sm:w-auto">+ Add Training</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm uppercase tracking-widest border-b border-slate-100">
                <th className="py-3">Employee</th>
                <th className="py-3">Training Name</th>
                <th className="py-3">Trainer</th>
                <th className="py-3">Date</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700">
              {visibleTrainings.map((t) => (
                <tr key={t.id} className="border-b border-slate-50">
                  <td className="py-4 font-bold">{t.employee}</td>
                  <td className="py-4">{t.training}</td>
                  <td className="py-4">{t.trainer}</td>
                  <td className="py-4">{t.date}</td>
                  <td className="py-4">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assign Course Modal */}
      {showAssignCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-white rounded-2xl p-4 sm:p-6">
            <h3 className="text-xl font-bold mb-4">Assign Course</h3>
            <div className="grid gap-3">
              <label className="text-sm font-semibold">Employee</label>
              <select value={assignForm.employeeId} onChange={e=>setAssignForm({...assignForm, employeeId: e.target.value})} className="px-4 py-2 border rounded-xl">
                <option value="">Select Employee</option>
                {visibleEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>

              <label className="text-sm font-semibold">Course Name</label>
              <input value={assignForm.course} onChange={e=>setAssignForm({...assignForm, course: e.target.value})} className="px-4 py-2 border rounded-xl" />

              <label className="text-sm font-semibold">Duration</label>
              <input value={assignForm.duration} onChange={e=>setAssignForm({...assignForm, duration: e.target.value})} className="px-4 py-2 border rounded-xl" />

              <label className="text-sm font-semibold">Progress (%)</label>
              <input type="number" value={assignForm.progress} onChange={e=>setAssignForm({...assignForm, progress: e.target.value})} className="px-4 py-2 border rounded-xl" />

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={()=>setShowAssignCourse(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                <button onClick={saveAssignCourse} className="px-4 py-2 rounded-xl bg-violet-900 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Assignment (kept after Employee Training) */}
      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-black text-violet-950 mb-4">2. Course Assignment</h2>
        <div className="mb-4">
          <button onClick={openAssignCourse} className="px-4 py-2 bg-violet-900 text-white rounded-xl">+ Assign Course</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm uppercase tracking-widest border-b border-slate-100">
                <th className="py-3">Employee</th>
                <th className="py-3">Course</th>
                <th className="py-3">Duration</th>
                <th className="py-3">Progress</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700">
              {visibleCourses.map((c) => (
                <tr key={c.id} className="border-b border-slate-50">
                  <td className="py-4 font-bold">{c.employee}</td>
                  <td className="py-4">{c.course}</td>
                  <td className="py-4">{c.duration}</td>
                  <td className="py-4 w-80">
                    <div className="mb-2"><ProgressBar p={c.progress} /></div>
                    <div className="text-xs text-slate-600 font-bold">{c.progress}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-black text-violet-950 mb-4">3. Skill Tracking</h2>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Employee" className="flex-1 px-4 py-3 border rounded-xl" />
          <button onClick={() => setSearch('')} className="w-full px-4 py-3 bg-slate-100 rounded-xl sm:w-auto">Clear</button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-2">
              {filtered.map(emp => (
                <div key={emp.id} className={`p-3 rounded-xl border ${selected && selected.id === emp.id ? 'border-violet-900 bg-violet-50' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-bold">{emp.name}</div>
                    <div>
                      <button onClick={() => setSelected(emp)} className="px-3 py-1 text-xs bg-violet-900 text-white rounded-xl">View</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selected ? (
              <div>
                <h3 className="text-xl font-bold mb-2">{selected.name}</h3>
                <div className="mb-3">
                  <div className="font-semibold">Skills</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(() => {
                      let arr = [];
                      try { arr = JSON.parse(selected.skills || '[]'); } catch(e) { arr = (selected.skills||'').split(',').map(s=>s.trim()).filter(Boolean); }
                      return arr.length ? arr.map((s,i)=> <span key={i} className="px-3 py-1 bg-violet-50 text-violet-800 rounded-full">{s}</span>) : <div className="text-slate-400">No skills</div>;
                    })()}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="font-semibold">Experience</div>
                  <div className="text-slate-700">Intermediate</div>
                </div>

                <div className="mb-3">
                  <div className="font-semibold">Last Updated</div>
                  <div className="text-slate-700">10 Jul</div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => addSkill(selected)} className="px-4 py-2 bg-violet-900 text-white rounded-xl">Quick Add Skill</button>
                    <button onClick={openAddSkill} className="px-4 py-2 bg-slate-100 rounded-xl">Add Skill</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500">Select an employee to view skills and add new ones.</div>
            )}
          </div>
        </div>
      </section>

      {/* Certification Records */}
      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-violet-950">4. Certification Records</h2>
          <button onClick={openAddCert} className="w-full px-4 py-2 bg-violet-900 text-white rounded-xl sm:w-auto">+ Add Certificate</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm uppercase tracking-widest border-b border-slate-100">
                <th className="py-3">Employee</th>
                <th className="py-3">Certificate</th>
                <th className="py-3">Issued</th>
                <th className="py-3">Expiry</th>
                <th className="py-3">Status</th>
                <th className="py-3">Download</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700">
              {visibleCerts.map(c => (
                <tr key={c.id} className="border-b border-slate-50">
                  <td className="py-4 font-bold">{c.employee}</td>
                  <td className="py-4">{c.certificate}</td>
                  <td className="py-4">{c.issued}</td>
                  <td className="py-4">{c.expiry}</td>
                  <td className="py-4">{c.status}</td>
                  <td className="py-4">{c.file ? <a href={c.file} download className="px-3 py-1 bg-slate-100 rounded-xl">PDF</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-white rounded-2xl p-4 sm:p-6">
            <h3 className="text-xl font-bold mb-4">Add Skill</h3>
            <div className="grid gap-3">
              <label className="text-sm font-semibold">Employee</label>
              <select value={skillForm.employeeId} onChange={e=>setSkillForm({...skillForm, employeeId: e.target.value})} className="px-4 py-2 border rounded-xl">
                <option value="">Select Employee</option>
                {visibleEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>

              <label className="text-sm font-semibold">Skill</label>
              <input value={skillForm.skill} onChange={e=>setSkillForm({...skillForm, skill: e.target.value})} className="px-4 py-2 border rounded-xl" />

              <label className="text-sm font-semibold">Level</label>
              <select value={skillForm.level} onChange={e=>setSkillForm({...skillForm, level: e.target.value})} className="px-4 py-2 border rounded-xl">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={()=>setShowAddSkill(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                <button onClick={saveSkillFromModal} className="px-4 py-2 rounded-xl bg-violet-900 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      {showAddCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white rounded-2xl p-4 sm:p-6">
            <h3 className="text-xl font-bold mb-4">Add Certificate</h3>
            <div className="grid gap-3">
              <label className="text-sm font-semibold">Employee</label>
              <select value={certForm.employeeId} onChange={e=>setCertForm({...certForm, employeeId: e.target.value})} className="px-4 py-2 border rounded-xl">
                <option value="">Select Employee</option>
                {visibleEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>

              <label className="text-sm font-semibold">Certificate Name</label>
              <input value={certForm.certificate} onChange={e=>setCertForm({...certForm, certificate: e.target.value})} className="px-4 py-2 border rounded-xl" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Issued Date</label>
                  <input type="date" value={certForm.issued} onChange={e=>setCertForm({...certForm, issued: e.target.value})} className="px-4 py-2 border rounded-xl w-full" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Expiry Date</label>
                  <input type="date" value={certForm.expiry} onChange={e=>setCertForm({...certForm, expiry: e.target.value})} className="px-4 py-2 border rounded-xl w-full" />
                </div>
              </div>

              <label className="text-sm font-semibold">Upload Certificate</label>
              <input type="file" onChange={e=>setCertForm({...certForm, file: e.target.files[0]})} />

              <label className="text-sm font-semibold">Status</label>
              <select value={certForm.status} onChange={e=>setCertForm({...certForm, status: e.target.value})} className="px-4 py-2 border rounded-xl">
                <option>Valid</option>
                <option>Expired</option>
              </select>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={()=>setShowAddCert(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                <button onClick={saveCert} className="px-4 py-2 rounded-xl bg-violet-900 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Training Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white rounded-2xl p-4 sm:p-6">
            <h3 className="text-xl font-bold mb-4">Assign Training</h3>
            <div className="grid gap-3">
              <label className="text-sm font-semibold">Employee</label>
              <select value={form.employeeId} onChange={e=>setForm({...form, employeeId: e.target.value})} className="px-4 py-2 border rounded-xl">
                <option value="">Select Employee</option>
                {visibleEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>

              <label className="text-sm font-semibold">Training Name</label>
              <input value={form.training} onChange={e=>setForm({...form, training: e.target.value})} className="px-4 py-2 border rounded-xl" />

              <label className="text-sm font-semibold">Trainer</label>
              <input value={form.trainer} onChange={e=>setForm({...form, trainer: e.target.value})} className="px-4 py-2 border rounded-xl" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate: e.target.value})} className="px-4 py-2 border rounded-xl w-full" />
                </div>
                <div>
                  <label className="text-sm font-semibold">End Date</label>
                  <input type="date" value={form.endDate} onChange={e=>setForm({...form, endDate: e.target.value})} className="px-4 py-2 border rounded-xl w-full" />
                </div>
              </div>

              <label className="text-sm font-semibold">Status</label>
              <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})} className="px-4 py-2 border rounded-xl">
                <option>Completed</option>
                <option>Ongoing</option>
                <option>Pending</option>
              </select>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                <button onClick={saveTraining} className="px-4 py-2 rounded-xl bg-violet-900 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
