import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/as group logo.jpeg';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default function HiringForm() {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', position: '', message: ''
  });
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, resume: 'Only PDF or DOCX files are allowed' }));
      setResume(null);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: `File must be smaller than ${MAX_FILE_SIZE_MB}MB` }));
      setResume(null);
      e.target.value = '';
      return;
    }
    setErrors(prev => ({ ...prev, resume: '' }));
    setResume(file);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?\d{10,13}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Enter a valid phone number (10 digits)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Desired position is required';
    }

    if (formData.message.trim().length > 1000) {
      newErrors.message = 'Cover letter must be under 1000 characters';
    }

    if (!resume) {
      newErrors.resume = 'Resume is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key].trim()));
      data.append('resume', resume);

      await axios.post('http://localhost:8000/hiring/apply', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSubmitted(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrors(prev => ({ ...prev, form: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-6 font-sans">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 mx-auto bg-violet-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-violet-950 mb-3">Application Received</h2>
          <p className="text-slate-500 text-lg mb-8">
            Thanks for applying to AS GROUP. Our hiring team will review your application and reach out if there's a match.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-violet-950 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <form onSubmit={handleSubmit} noValidate className="bg-white p-12 rounded-[2rem] shadow-2xl border border-slate-100">

        {/* Branding Section */}
        <div className="mb-10 text-center border-b border-slate-100 pb-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="AS Group Logo" className="w-24 h-24 object-contain rounded-3xl shadow-lg border border-slate-100" />
          </div>
          <h1 className="text-4xl font-black text-violet-950 tracking-tight">AS GROUP - Careers</h1>
          <p className="text-slate-500 mt-3 text-lg font-medium">Join our growing team and build the future with us.</p>
        </div>

        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold">
            {errors.form}
          </div>
        )}

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Full Name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(v) => updateField('name', v)}
            error={errors.name}
          />
          <Field
            label="Phone Number"
            placeholder="+91 00000 00000"
            value={formData.phone}
            onChange={(v) => updateField('phone', v)}
            error={errors.phone}
          />
        </div>

        <div className="mt-6">
          <Field
            label="Email Address"
            type="email"
            placeholder="name@asgroup.com"
            value={formData.email}
            onChange={(v) => updateField('email', v)}
            error={errors.email}
          />
        </div>

        <div className="mt-6">
          <Field
            label="Desired Position"
            placeholder="e.g. Software Developer"
            value={formData.position}
            onChange={(v) => updateField('position', v)}
            error={errors.position}
          />
        </div>

        <div className="space-y-2 mt-6">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cover Letter</label>
            <span className="text-xs text-slate-300 font-medium">{formData.message.length}/1000</span>
          </div>
          <textarea
            placeholder="Tell us why you are a great fit..."
            value={formData.message}
            maxLength={1000}
            className={`w-full p-4 border rounded-2xl h-32 focus:ring-4 focus:ring-violet-50 focus:border-violet-600 transition-all outline-none ${errors.message ? 'border-red-400' : 'border-slate-200'}`}
            onChange={(e) => updateField('message', e.target.value)}
          />
          {errors.message && <p className="text-red-500 text-xs font-semibold ml-1">{errors.message}</p>}
        </div>

        {/* Upload Area */}
        <div className={`mt-8 p-8 border-2 border-dashed rounded-3xl text-center transition-all duration-300 ${errors.resume ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50 hover:bg-violet-50'}`}>
          <label className="block text-sm font-bold text-slate-700 mb-1">Attach Resume</label>
          <p className="text-xs text-slate-400 mb-3">PDF or DOCX, up to {MAX_FILE_SIZE_MB}MB</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-violet-900 file:text-white hover:file:bg-black transition-all cursor-pointer"
          />
          {resume && !errors.resume && (
            <p className="text-xs text-violet-700 font-semibold mt-3">✓ {resume.name}</p>
          )}
          {errors.resume && <p className="text-red-500 text-xs font-semibold mt-3">{errors.resume}</p>}
        </div>

        {/* Submit */}
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full mt-10 bg-violet-950 text-white py-5 rounded-2xl font-black text-lg hover:bg-black hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSubmitting ? "Processing..." : "Submit Application to AS GROUP"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange, error }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 border rounded-2xl focus:ring-4 focus:ring-violet-50 focus:border-violet-600 transition-all outline-none ${error ? 'border-red-400' : 'border-slate-200'}`}
      />
      {error && <p className="text-red-500 text-xs font-semibold ml-1">{error}</p>}
    </div>
  );
}
