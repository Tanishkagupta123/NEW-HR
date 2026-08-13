import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AddEmployee() {
  const { employee, setEmployee, handleOnboard, departments, addDepartment } = useOutletContext();
  
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setEmployee({...employee, [field]: value});
    if (errors[field]) setErrors({...errors, [field]: ''});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      updateField('profile_pic', file);
    }
  };

  // Frontend validation
  const validate = () => {
    const newErrors = {};
    if (!employee.name)          newErrors.name          = 'Full Name is required';
    if (!employee.email)         newErrors.email         = 'Email Address is required';
    if (!employee.phone)         newErrors.phone         = 'Phone Number is required';
    if (!employee.password)      newErrors.password      = 'Password is required';
    else if (!/^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(employee.password))
      newErrors.password      = 'Password must be 8+ chars and include a number plus symbol';
    if (!employee.joining_date)  newErrors.joining_date  = 'Joining Date is required';
    if (!employee.department)    newErrors.department    = 'Department is required';
    if (!employee.designation)   newErrors.designation   = 'Designation is required';
    if (!employee.monthly_salary) newErrors.monthly_salary = 'Monthly Salary is required';
    if (!employee.role)          newErrors.role          = 'Role is required';
    if (!employee.role_position) newErrors.role_position = 'Role Position is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) handleOnboard();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-10 bg-white rounded-[2rem] shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 pb-10 mb-10 border-b border-slate-100">
        <div className="relative group">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-inner overflow-hidden">
                {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-slate-400 text-xs font-bold uppercase">Upload</span>
                )}
            </div>
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="absolute bottom-2 right-2 bg-violet-900 text-white p-2 rounded-full shadow-lg text-[10px]">📷</div>
        </div>
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Onboard New Employee</h1>
            <p className="text-slate-500 mt-2 font-medium">Digital HR Onboarding Portal - Professional & Secure</p>
        </div>
      </div>
      
      {/* SECTION 1: Personal Details */}
      <div className="mb-12">
        <h2 className="text-[11px] font-black text-violet-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet-600"></span> Personal Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Input label="Full Name" placeholder="Enter Your Name" value={employee.name || ''} onChange={(v) => updateField('name', v)} error={errors.name} />
          <Input label="Email Address" type="email" placeholder="email@asgroup.com" value={employee.email || ''} onChange={(v) => updateField('email', v)} error={errors.email} />
          <Input label="Phone Number" placeholder="+91 00000 00000" value={employee.phone || ''} onChange={(v) => updateField('phone', v)} error={errors.phone} />
          <Input label="Password" type="password" placeholder="Enter password" value={employee.password || ''} onChange={(v) => updateField('password', v)} error={errors.password} />
          <Input label="Joining Date" type="date" value={employee.joining_date || ''} onChange={(v) => updateField('joining_date', v)} error={errors.joining_date} />
        </div>
      </div>

      {/* SECTION 2: Employment Details */}
      <div className="mb-12">
        <h2 className="text-[11px] font-black text-violet-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet-600"></span> Employment Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Department */}
          <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Department</label>
            <div className="flex gap-2 items-center">
              <select className={`flex-1 p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-500 transition ${errors.department ? 'border-red-400' : 'border-slate-100'}`} value={employee.department || ''} onChange={(e) => updateField('department', e.target.value)}>
                <option value="" disabled>Select Dept</option>
                {departments && departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <button type="button" onClick={(e) => { e.preventDefault(); if (addDepartment) addDepartment(); }} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xl hover:bg-violet-700 transition relative z-20 cursor-pointer">+</button>
            </div>
            {errors.department && <p className="text-red-500 text-[10px] mt-1">{errors.department}</p>}
          </div>

          <Input label="Designation" placeholder="e.g. Senior Developer" value={employee.designation || ''} onChange={(v) => updateField('designation', v)} error={errors.designation} />
          <Input label="Monthly Salary (₹)" type="number" placeholder="Enter monthly salary" value={employee.monthly_salary || ''} onChange={(v) => updateField('monthly_salary', v)} error={errors.monthly_salary} />

          {/* Role */}
          <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Role</label>
            <select className={`p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-500 transition ${errors.role ? 'border-red-400' : 'border-slate-100'}`} value={employee.role || ''} onChange={(e) => updateField('role', e.target.value)}>
              <option value="" disabled>Select Role</option>
              <option value="employee">Employee</option>
              {/* <option value="admin">Admin</option> */}
              {/* <option value="manager">Manager</option> */}
              <option value="tl">TL</option>
              {/* <option value="hr">HR</option> */}
            </select>
            {errors.role && <p className="text-red-500 text-[10px] mt-1">{errors.role}</p>}
          </div>

          {/* Role Position */}
          <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Role Position</label>
            <select className={`p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-500 transition ${errors.role_position ? 'border-red-400' : 'border-slate-100'}`} value={employee.role_position || ''} onChange={(e) => updateField('role_position', e.target.value)}>
              <option value="" disabled>Select Position</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
            {errors.role_position && <p className="text-red-500 text-[10px] mt-1">{errors.role_position}</p>}
          </div>

        </div>
      </div>

      {/* SECTION 3: Documents */}
      <div className="bg-slate-50 p-8 rounded-3xl mb-10 border border-slate-200">
        <h3 className="text-[11px] font-black text-slate-900 mb-8 uppercase tracking-[0.2em]">Required Identity Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 transition-all">
            <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase">Aadhaar Card</label>
            <input type="file" name="aadhaar_file" onChange={(e) => updateField('aadhaar_file', e.target.files[0])} className="w-full text-[10px] text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer" />
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 transition-all">
            <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase">PAN Card</label>
            <input type="file" name="pan_file" onChange={(e) => updateField('pan_file', e.target.files[0])} className="w-full text-[10px] text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer" />
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 transition-all">
            <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase">Certificates</label>
            <input type="file" name="certificate_file" onChange={(e) => updateField('certificate_file', e.target.files[0])} className="w-full text-[10px] text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between pt-8 border-t border-slate-100">
        <p className="text-xs text-slate-400 font-medium italic">* Data security and compliance enforced.</p>
        <button onClick={handleSubmit} className="w-full md:w-auto bg-violet-900 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-violet-200">
          Onboard Employee
        </button>
      </div>

    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange, disabled, className = "", error }) {
  return (
    <div className="flex flex-col">
      <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">{label}</label>
      <input
        disabled={disabled}
        type={type}
        value={value}
        className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-500 transition ${className} ${disabled ? 'opacity-50' : ''} ${error ? 'border-red-400' : 'border-slate-100'}`}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">{label}</label>
      <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-violet-500 transition" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}