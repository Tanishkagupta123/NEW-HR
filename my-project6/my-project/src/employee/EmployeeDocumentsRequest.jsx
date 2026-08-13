import { API_BASE_URL } from '../config/api';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployeeDocumentsRequest() {
  const [fields, setFields] = useState({
    employeeName: '',
    emailAddress: '',
    employeeId: '',
    department: '',
    designation: '',
    resignationDate: '',
    noticeStartDate: '',
    lastWorkingDate: '',
    noticePeriodDuration: '',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setFields((currentFields) => ({
      ...currentFields,
      employeeName: storedUser.name || '',
      emailAddress: storedUser.email || '',
      employeeId: storedUser.employee_code || storedUser.id || '',
      department: storedUser.department || '',
      designation: storedUser.role_position || storedUser.position || ''
    }));
  }, []);

  const handleChange = (key, value) => {
    setFields((currentFields) => ({ ...currentFields, [key]: value }));
  };

  const handleSendNotice = async () => {
    setMessage('');

    if (!fields.employeeName.trim() || !fields.emailAddress.trim()) {
      setMessage('Name and email are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.emailAddress)) {
      setMessage('Valid email address is required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/employee-documents/send-notice-to-hr`, fields);
      setMessage(response.data?.message || 'Notice period request sent to HR successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send notice period request to HR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-violet-600">Employee Documents</p>
        <h1 className="mt-2 text-3xl font-black text-violet-950">Send Notice Period to HR</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Notice period details fill karke HR team ko request send karein.
        </p>
      </div>

      {message && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
          message.toLowerCase().includes('failed') || message.toLowerCase().includes('required') || message.toLowerCase().includes('valid')
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-green-200 bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">Notice Period Details</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Employee Name', key: 'employeeName' },
            { label: 'Email Address', key: 'emailAddress', type: 'email' },
            { label: 'Employee ID', key: 'employeeId' },
            { label: 'Department', key: 'department' },
            { label: 'Designation', key: 'designation' },
            { label: 'Resignation Date', key: 'resignationDate', type: 'date' },
            { label: 'Notice Start Date', key: 'noticeStartDate', type: 'date' },
            { label: 'Last Working Date', key: 'lastWorkingDate', type: 'date' },
            { label: 'Notice Period Duration', key: 'noticePeriodDuration' }
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-semibold text-slate-700">{field.label}</span>
              <input
                type={field.type || 'text'}
                value={fields[field.key] || ''}
                onChange={(event) => handleChange(field.key, event.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">Reason / Message</span>
          <textarea
            rows="4"
            value={fields.reason}
            onChange={(event) => handleChange('reason', event.target.value)}
            placeholder="Enter reason or message for HR"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </label>

        <button
          onClick={handleSendNotice}
          disabled={loading}
          className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Notice Period to HR'}
        </button>
      </div>
    </div>
  );
}
