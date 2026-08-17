import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const DOC_KEYS = [
  ['aadhaar_file', 'Aadhaar Card'],
  ['pan_file', 'PAN Card'],
  ['certificate_file', 'Certificates']
];

const BLANK_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  joining_date: '',
  department: '',
  designation: '',
  monthly_salary: '',
  role: 'employee',
  role_position: '',
  position: 'Employee',
  employee_code: '',
  skills: '',
  profile_pic: null,
  aadhaar_file: null,
  pan_file: null,
  certificate_file: null
};

export default function AllEmployees() {
  const { employeesList = [], fetchData, departments = [] } = useOutletContext();
  const navigate = useNavigate();

  // Filter & Layout States
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal States
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'employment' | 'docs'
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const buildUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    return path.startsWith('http') ? path : `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  };

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleResetFilters = () => {
    setSearch('');
    setDeptFilter('ALL');
    setRoleFilter('ALL');
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = employeesList.length;
    const verifiedDocs = employeesList.filter((e) => e.aadhaar_file && e.pan_file && e.certificate_file).length;
    const tlCount = employeesList.filter((e) => e.role === 'tl' || e.role_position === 'lead').length;
    return { total, verifiedDocs, tlCount };
  }, [employeesList]);

  // Department Options
  const departmentOptions = useMemo(() => {
    const fromEmployees = employeesList.map((e) => e.department).filter(Boolean);
    return Array.from(new Set([...fromEmployees, ...departments]));
  }, [employeesList, departments]);

  // Filtered Employee Results
  const filteredEmployees = useMemo(() => {
    return employeesList.filter((item) => {
      const matchSearch = [item.name, item.email, item.employee_code, item.designation, item.department]
        .some((val) => String(val || '').toLowerCase().includes(search.toLowerCase().trim()));
      
      const matchDept = deptFilter === 'ALL' || item.department === deptFilter;
      const matchRole = roleFilter === 'ALL' || item.role === roleFilter || item.role_position === roleFilter;

      return matchSearch && matchDept && matchRole;
    });
  }, [employeesList, search, deptFilter, roleFilter]);

  // Open Edit Modal
  const openModal = async (item) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/employees/${item.id}`);
      if (!data) throw new Error('Employee not found');
      
      setEmployee(data);
      let formattedSkills = data.skills || '';
      try {
        const parsed = JSON.parse(formattedSkills);
        formattedSkills = Array.isArray(parsed) ? parsed.join(', ') : formattedSkills;
      } catch {
        /* plain text */
      }

      setForm({
        ...BLANK_FORM,
        ...data,
        phone: data.phone_number || data.phone || '',
        joining_date: data.joining_date ? String(data.joining_date).slice(0, 10) : '',
        skills: formattedSkills,
        password: ''
      });
      setActiveTab('personal');
      setError('');
      setSuccessMsg('');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to load employee details.');
    }
  };

  const closeModal = () => {
    setEmployee(null);
    setForm(BLANK_FORM);
    setError('');
    setSuccessMsg('');
  };

  // Submit Updated Profile
  const handleSave = async (e) => {
    e.preventDefault();

    // 1. Full Name
    if (!form.name || !form.name.trim()) {
      setError('Full Name is required.');
      return;
    }

    // 2. Email Address
    const cleanEmail = String(form.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      setError('Email Address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 2b. Duplicate Email Check
    const duplicateEmployee = employeesList.find(
      (emp) => String(emp.id) !== String(employee.id) && String(emp.email || '').trim().toLowerCase() === cleanEmail
    );
    if (duplicateEmployee) {
      setError(`The email "${cleanEmail}" is already registered to another employee (${duplicateEmployee.name}). Please use a different email.`);
      return;
    }

    // 3. Phone Number
    const cleanPhone = String(form.phone || '').replace(/^\+91/, '').trim();
    if (!cleanPhone) {
      setError('Phone Number is required.');
      return;
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    // 4. Joining Date
    if (!form.joining_date) {
      setError('Joining Date is required.');
      return;
    }

    // 5. Department & Designation
    if (!form.department) {
      setError('Department selection is required.');
      return;
    }
    if (!form.designation || !form.designation.trim()) {
      setError('Designation is required.');
      return;
    }

    // 6. Monthly Salary
    if (!form.monthly_salary || Number(form.monthly_salary) <= 0) {
      setError('Monthly Salary must be a positive number greater than 0.');
      return;
    }

    // 7. Role & Role Position
    if (!form.role || !form.role_position) {
      setError('Role and Seniority level selection are required.');
      return;
    }

    // 8. Password Validation (if provided)
    if (form.password && form.password.trim() !== '') {
      if (!/^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(form.password.trim())) {
        setError('Password must be at least 8 characters and include at least one number and one special symbol.');
        return;
      }
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const body = new FormData();
      body.append('name', form.name.trim());
      body.append('email', cleanEmail);
      body.append('phone', cleanPhone);
      body.append('joining_date', form.joining_date);
      body.append('department', form.department);
      body.append('designation', form.designation.trim());
      body.append('monthly_salary', Number(form.monthly_salary));
      body.append('role', form.role);
      body.append('role_position', form.role_position);
      body.append('position', form.position || 'Employee');
      body.append('employee_code', form.employee_code || '');
      body.append('skills', form.skills || '');
      if (form.password && form.password.trim()) {
        body.append('password', form.password.trim());
      }

      ['profile_pic', 'aadhaar_file', 'pan_file', 'certificate_file'].forEach((key) => {
        if (form[key] instanceof File) body.append(key, form[key]);
      });

      await axios.put(`${API_BASE_URL}/employees/${employee.id}`, body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchData?.();
      setSuccessMsg('Employee details updated successfully!');
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  const isFiltered = search !== '' || deptFilter !== 'ALL' || roleFilter !== 'ALL';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* HEADER & TOP ACTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-600">People Management</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Employee Directory
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage employee profiles, roles, statutory document status, and department records.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/add-employee')}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 active:scale-95 sm:text-sm"
          >
            + Add New Employee
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Workforce</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Documents</p>
          <p className="mt-2 text-2xl font-black text-violet-600">
            {stats.verifiedDocs} <span className="text-xs font-semibold text-slate-400">/ {stats.total}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Leads & Management</p>
          <p className="mt-2 text-2xl font-black text-violet-600">{stats.tlCount}</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-4">
        {/* Compact Search Input */}
        <div className="relative w-full sm:w-64 lg:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-800 outline-none transition focus:border-violet-600 focus:bg-white focus:ring-3 focus:ring-violet-100 sm:text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-600 focus:bg-white sm:text-sm"
          >
            <option value="ALL">All Departments</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-600 focus:bg-white sm:text-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="employee">Employees</option>
            <option value="tl">Team Leads</option>
            <option value="lead">Leads</option>
            <option value="senior">Senior</option>
            <option value="mid">Mid</option>
            <option value="junior">Junior</option>
          </select>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
            >
              Reset
            </button>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/70 p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white shadow-xs text-violet-700' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${viewMode === 'table' ? 'bg-white shadow-xs text-violet-700' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT: GRID VIEW OR TABLE VIEW */}
      {filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h3 className="text-base font-bold text-slate-800">No employees found</h3>
          <p className="mt-1 text-xs text-slate-500">Try refining your search terms or resetting your filters.</p>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-violet-600 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((item) => {
            const uploadedDocsCount = DOC_KEYS.filter(([key]) => item[key]).length;
            const isFullyVerified = uploadedDocsCount === 3;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Avatar & Code */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={item.name} src={buildUrl(item.profile_pic)} />
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-black text-slate-950 group-hover:text-violet-600 transition-colors">
                          {item.name || 'Unnamed Employee'}
                        </h2>
                        <p className="truncate text-xs font-medium text-slate-500">
                          {item.designation || 'Staff Member'}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-violet-50 px-2.5 py-1 font-mono text-[11px] font-bold text-violet-700 border border-violet-100">
                      {item.employee_code || `EMP-${item.id}`}
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                      {item.department || 'General'}
                    </span>
                    <span className="rounded-md bg-violet-50 px-2 py-0.5 font-bold text-violet-700 capitalize">
                      {item.role_position || item.role || 'employee'}
                    </span>
                    {item.monthly_salary && (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                        ₹{Number(item.monthly_salary).toLocaleString('en-IN')}/mo
                      </span>
                    )}
                  </div>

                  {/* Contact Email */}
                  <div className="mt-3 text-xs text-slate-500">
                    <p className="truncate font-medium hover:text-slate-800" title={item.email}>
                      {item.email || 'No email registered'}
                    </p>
                  </div>
                </div>

                {/* Footer: Documents Status & Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`h-2 w-2 rounded-full ${isFullyVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span className={`font-semibold ${isFullyVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {uploadedDocsCount}/3 Docs
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 shadow-xs"
                  >
                    Manage Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Department & Level</th>
                  <th className="px-5 py-3.5">Salary</th>
                  <th className="px-5 py-3.5">KYC Documents</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((item) => {
                  const uploadedDocsCount = DOC_KEYS.filter(([key]) => item[key]).length;
                  const isFullyVerified = uploadedDocsCount === 3;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={item.name} src={buildUrl(item.profile_pic)} size="small" />
                          <div>
                            <p className="font-bold text-slate-950">{item.name || 'Unnamed'}</p>
                            <p className="text-[11px] text-slate-500">{item.designation || 'Staff'} · <span className="font-mono text-violet-600 font-bold">{item.employee_code || `EMP-${item.id}`}</span></p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{item.email}</p>
                        <p className="text-[11px] text-slate-500">{item.phone_number || item.phone || 'No phone'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{item.department || 'General'}</p>
                        <p className="text-[11px] font-medium text-violet-600 capitalize">{item.role_position || item.role || 'employee'}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {item.monthly_salary ? `₹${Number(item.monthly_salary).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${isFullyVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {isFullyVerified ? 'Verified (3/3)' : `${uploadedDocsCount}/3 Uploaded`}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openModal(item)}
                          className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-600 hover:text-white transition-colors"
                        >
                          Edit Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {employee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs transition-opacity"
          onMouseDown={closeModal}
        >
          <form
            onSubmit={handleSave}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex items-center gap-4">
                <Avatar name={employee.name} src={buildUrl(employee.profile_pic)} size="large" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">{employee.name}</h2>
                    <span className="rounded-md bg-violet-50 border border-violet-100 px-2 py-0.5 font-mono text-xs font-bold text-violet-700">
                      {employee.employee_code || `EMP-${employee.id}`}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {employee.designation || 'Employee'} · Joined {employee.joining_date ? String(employee.joining_date).slice(0, 10) : 'N/A'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-white px-6">
              {[
                { id: 'personal', label: 'Personal Info' },
                { id: 'employment', label: 'Employment & Pay' },
                { id: 'docs', label: 'KYC Documents' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 py-3 px-4 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
                  {successMsg}
                </div>
              )}

              {/* TAB 1: PERSONAL INFO */}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Full Name *" value={form.name} onChange={(v) => updateForm('name', v)} />
                  <FormField label="Email Address *" type="email" value={form.email} onChange={(v) => updateForm('email', v)} />
                  <FormField label="Phone Number *" value={form.phone} onChange={(v) => updateForm('phone', v)} />
                  <FormField label="Joining Date *" type="date" value={form.joining_date} onChange={(v) => updateForm('joining_date', v)} />
                  <FormField label="Employee Code" value={form.employee_code} onChange={(v) => updateForm('employee_code', v)} />
                  <PasswordField label="New Password (optional)" placeholder="Leave blank to keep existing password" value={form.password} onChange={(v) => updateForm('password', v)} />
                </div>
              )}

              {/* TAB 2: EMPLOYMENT & PAY */}
              {activeTab === 'employment' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormSelect
                    label="Department *"
                    value={form.department}
                    onChange={(v) => updateForm('department', v)}
                    options={[...new Set([form.department, ...departments].filter(Boolean))]}
                  />
                  <FormField label="Designation *" value={form.designation} onChange={(v) => updateForm('designation', v)} />
                  <FormField label="Monthly Salary (₹) *" type="number" value={form.monthly_salary} onChange={(v) => updateForm('monthly_salary', v)} />
                  <FormSelect
                    label="Account Role *"
                    value={form.role}
                    onChange={(v) => updateForm('role', v)}
                    options={['employee', 'tl']}
                  />
                  <FormSelect
                    label="Seniority / Role Position *"
                    value={form.role_position}
                    onChange={(v) => updateForm('role_position', v)}
                    options={['junior', 'mid', 'senior', 'lead']}
                  />
                  <FormField label="Position Title" value={form.position} onChange={(v) => updateForm('position', v)} />
                  <div className="sm:col-span-2">
                    <FormField
                      label="Skills (Comma Separated)"
                      placeholder="e.g. React, Node.js, Express, MySQL"
                      value={form.skills}
                      onChange={(v) => updateForm('skills', v)}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: KYC DOCUMENTS */}
              {activeTab === 'docs' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DocUploadCard
                    label="Profile Picture"
                    filePath={employee.profile_pic}
                    fileUrl={buildUrl(employee.profile_pic)}
                    onChange={(file) => updateForm('profile_pic', file)}
                  />
                  {DOC_KEYS.map(([key, label]) => (
                    <DocUploadCard
                      key={key}
                      label={label}
                      filePath={employee[key]}
                      fileUrl={buildUrl(employee[key])}
                      onChange={(file) => updateForm(key, file)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* HELPER COMPONENTS */

function Avatar({ name, src, size = 'normal' }) {
  const initials = String(name || 'Emp')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const dimensions =
    size === 'large' ? 'h-14 w-14 text-base' : size === 'small' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-xs';

  return (
    <div className={`relative shrink-0 ${dimensions} overflow-hidden rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center border border-violet-200 shadow-xs`}>
      <span>{initials}</span>
      {src && (
        <img
          src={src}
          alt={name}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange, placeholder = '' }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 outline-none transition focus:border-violet-600 focus:bg-white focus:ring-3 focus:ring-violet-100"
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder = '' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3 pr-10 text-xs text-slate-800 outline-none transition focus:border-violet-600 focus:bg-white focus:ring-3 focus:ring-violet-100"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-violet-600 transition"
          title={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-6-6L3 3" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 outline-none transition focus:border-violet-600 focus:bg-white capitalize"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function DocUploadCard({ label, filePath, fileUrl, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-900">{label}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${filePath ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {filePath ? 'Uploaded' : 'Missing'}
        </span>
      </div>

      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-[11px] font-bold text-violet-600 hover:underline"
        >
          View Current Document
        </a>
      )}

      <div className="pt-2 border-t border-slate-200/60">
        <label className="block cursor-pointer text-[11px] font-bold text-slate-500">
          Upload Replacement File
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-violet-600 file:text-white hover:file:bg-violet-700"
          />
        </label>
      </div>
    </div>
  );
}
