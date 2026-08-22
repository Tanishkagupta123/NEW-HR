import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Download, Mail, Plus, X, CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import logo from '../assets/ASGROUP-logo.webp';

const CERTIFICATE_TYPES = [
  { id: 'training', name: 'Training Completion', icon: '', color: 'from-blue-600 to-blue-400' },
  { id: 'achievement', name: 'Excellence Award', icon: '', color: 'from-yellow-600 to-yellow-400' },
  { id: 'course', name: 'Course Completion', icon: '', color: 'from-green-600 to-green-400' },
  { id: 'excellence', name: 'Outstanding Performance', icon: '', color: 'from-purple-600 to-purple-400' },
  { id: 'participation', name: 'Participation', icon: '', color: 'from-pink-600 to-pink-400' }
];

export default function CertificateManagement() {
  const [mode, setMode] = useState('existing'); // 'existing' or 'new'
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [certificateType, setCertificateType] = useState('training');
  const [certificateData, setCertificateData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // New Employee Mode
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    company: 'Your Company'
  });

  // Certificate Records
  const [certificates, setCertificates] = useState([]);

  // Fetch Employees and certificate history
  useEffect(() => {
    fetchEmployees();
    fetchCertificates();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
      setMessage('❌ Failed to fetch employees');
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/certificates`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const mapped = (res.data || []).map((cert) => ({
        id: cert.id,
        recipientName: cert.recipient_name,
        recipientEmail: cert.recipient_email,
        type: cert.certificate_type || (cert.certificate_type_id ? `Type ${cert.certificate_type_id}` : 'Certificate'),
        issuedDate: cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : '',
        certificatePath: cert.file_path || cert.certificate_path
      }));
      setCertificates(mapped);
    } catch (err) {
      console.error('Failed to fetch certificates', err);
      setMessage('❌ Failed to fetch issued certificates');
    }
  };

  // Generate Certificate (creates a simple PDF-like structure or HTML)
  const generateCertificate = async (recipientName, recipientEmail, certType) => {
    try {
      setLoading(true);
      
      // Call backend to generate and send certificate
      const response = await axios.post(`${API_BASE_URL}/admin/certificates/generate-certificate`, {
        recipientName,
        recipientEmail,
        certificateType: certType,
        description: certificateData
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (err) {
      console.error('Error generating certificate:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send Certificate to Selected Employee
  const handleSendToExistingEmployee = async () => {
    if (!selectedEmployee || !certificateType) {
      setMessage('❌ Please select an employee and certificate type');
      return;
    }

    try {
      setLoading(true);
      const result = await generateCertificate(
        selectedEmployee.name,
        selectedEmployee.email,
        certificateType
      );

      // Refresh list from database
      await fetchCertificates();

      setMessage(`✅ Certificate sent to ${selectedEmployee.name}!`);
      setSelectedEmployee(null);
      setCertificateType('training');
      setCertificateData('');

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Failed to send certificate'}`);
    } finally {
      setLoading(false);
    }
  };

  // Send Certificate to New Employee
  const handleSendToNewEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !certificateType) {
      setMessage('❌ Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const result = await generateCertificate(
        newEmployee.name,
        newEmployee.email,
        certificateType
      );

      // Refresh list from database
      await fetchCertificates();

      setMessage(`✅ Certificate sent to ${newEmployee.name}!`);
      setNewEmployee({ name: '', email: '', company: 'Your Company' });
      setCertificateType('training');
      setCertificateData('');

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Failed to send certificate'}`);
    } finally {
      setLoading(false);
    }
  };

  // Download Certificate
  const handleDownloadCertificate = (cert) => {
    const path = cert.certificatePath || cert.file_path; // Handle both just in case
    if (path) {
      const fileUrl = path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = `${cert.recipientName || 'Certificate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setMessage('⚠️ No downloadable file available for this certificate on the server.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Delete Certificate
  const handleDeleteCertificate = async (cert) => {
    if (!window.confirm(`Are you sure you want to delete the certificate for ${cert.recipientName || 'this user'}?`)) return;
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/admin/certificates/${cert.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage(`✅ Certificate deleted successfully`);
      fetchCertificates();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Failed to delete certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src={logo} alt="ASGROUP DIGITAL PVT LTD" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-violet-950 mb-2">
            Certificate Management
          </h1>
          <p className="text-slate-600 text-lg">Issue and manage employee certificates</p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 transition-all ${
            message.includes('✅')
              ? 'bg-green-50 border-green-300 text-green-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {message.includes('✅') ? <CheckCircle size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-red-600" />}
            {message}
          </div>
        )}

        {/* Mode Selector - Improved */}
        <div className="flex flex-col gap-3 mb-8 sm:mb-12 sm:flex-row sm:justify-center sm:gap-4">
          <button
            onClick={() => setMode('existing')}
            className={`w-full px-6 py-3 sm:w-auto sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 ${
              mode === 'existing'
                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-violet-200'
            }`}
          >
             Select Existing Employee
          </button>
          <button
            onClick={() => setMode('new')}
            className={`w-full px-6 py-3 sm:w-auto sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 ${
              mode === 'new'
                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-violet-200'
            }`}
          >
             Add New Employee
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Certificate Form - Left Side (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-violet-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-violet-950 mb-6 sm:mb-8 flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                  {mode === 'existing' ? '' : ''}
                </div>
                {mode === 'existing' ? 'Select Employee' : 'New Employee Details'}
              </h2>

              {/* Existing Employee Mode */}
              {mode === 'existing' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                      🔍 Search & Select Employee
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type employee name or email..."
                        value={searchText}
                        onChange={(e) => {
                          setSearchText(e.target.value);
                          setShowEmployeeDropdown(true);
                        }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        className="w-full bg-white border-2 border-violet-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all"
                      />
                      
                      {/* Employee Dropdown */}
                      {showEmployeeDropdown && searchText && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-violet-400 rounded-xl max-h-48 overflow-y-auto z-50 shadow-xl">
                          {employees
                            .filter(emp =>
                              emp.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                              emp.email?.toLowerCase().includes(searchText.toLowerCase())
                            )
                            .map((emp) => (
                              <button
                                key={emp.id}
                                onClick={() => {
                                  setSelectedEmployee(emp);
                                  setSearchText('');
                                  setShowEmployeeDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-violet-100 transition-all border-b border-violet-100 last:border-b-0 text-slate-900"
                              >
                                <p className="font-semibold">{emp.name}</p>
                                <p className="text-xs text-slate-500">{emp.email}</p>
                              </button>
                            ))}
                          {employees.filter(emp =>
                            emp.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                            emp.email?.toLowerCase().includes(searchText.toLowerCase())
                          ).length === 0 && (
                            <div className="px-4 py-3 text-slate-500 text-center">
                              No employees found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedEmployee && (
                      <div className="mt-4 p-4 bg-violet-50 border-2 border-violet-300 rounded-2xl">
                        <p className="text-sm text-violet-700 mb-2">✓ Selected Employee</p>
                        <p className="text-xl font-bold text-violet-950">{selectedEmployee.name}</p>
                        <p className="text-sm text-violet-600 mt-1">{selectedEmployee.email}</p>
                        <button
                          onClick={() => {
                            setSelectedEmployee(null);
                            setSearchText('');
                          }}
                          className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 rounded-lg text-xs font-semibold transition-all"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* New Employee Mode */}
              {mode === 'new' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                       Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name..."
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      className="w-full bg-white border-2 border-violet-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                      ✉️ Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email..."
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="w-full bg-white border-2 border-violet-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                      🏢 Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter company name..."
                      value={newEmployee.company}
                      onChange={(e) => setNewEmployee({ ...newEmployee, company: e.target.value })}
                      className="w-full bg-white border-2 border-violet-200 rounded-xl px-5 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Certificate Type */}
              <div className="mt-8 pt-8 border-t border-violet-200">
                <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                   Certificate Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CERTIFICATE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCertificateType(type.id)}
                      className={`p-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        certificateType === type.id
                          ? `bg-violet-600 text-white shadow-lg shadow-violet-600/30`
                          : 'bg-slate-100 text-slate-700 border-2 border-violet-200 hover:border-violet-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate Description */}
              <div className="mt-8">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                   Additional Message (Optional)
                </label>
                <textarea
                  placeholder="Add special message or achievement details..."
                  value={certificateData}
                  onChange={(e) => setCertificateData(e.target.value)}
                  rows="4"
                  className="w-full bg-white border-2 border-violet-200 rounded-2xl px-5 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={
                  mode === 'existing'
                    ? handleSendToExistingEmployee
                    : handleSendToNewEmployee
                }
                disabled={loading}
                className="mt-8 w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
              >
                <Send size={24} />
                {loading ? 'Generating & Sending...' : 'Generate & Send Certificate'}
              </button>
            </div>
          </div>

          {/* Certificate Types Guide - Right Side */}
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-violet-200 h-fit">
            <h3 className="text-2xl font-bold text-violet-950 mb-6 flex items-center gap-2">
              <span className="text-3xl"></span> Certificate Types
            </h3>
            <div className="space-y-3">
              {CERTIFICATE_TYPES.map((type) => (
                <div key={type.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-violet-200 hover:border-violet-400 transition-all hover:shadow-md">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-semibold text-violet-950 text-sm">{type.name}</p>
                    <p className="text-xs text-violet-600 mt-1">Professional recognition award</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sent Certificates Section */}
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-violet-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-violet-950 flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                
              </div>
              Certificates Issued
            </h2>
            <div className="px-4 py-2 bg-violet-100 border border-violet-300 rounded-full">
              <p className="text-violet-700 font-bold">{certificates.length} Total</p>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-slate-600 text-lg">No certificates issued yet.</p>
              <p className="text-slate-500 text-sm mt-2">Create your first certificate to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => {
                const certType = CERTIFICATE_TYPES.find(t => t.id === cert.type);
                return (
                  <div
                    key={cert.id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                            <div className="p-3 bg-violet-100 rounded-xl text-xl">
                              {certType?.icon || <span className="font-bold">AS</span>}
                            </div>
                            <div>
                              <p className="text-violet-950 font-bold text-lg">{cert.recipientName}</p>
                              <p className="text-slate-600 text-sm">{cert.recipientEmail}</p>
                              <p className="text-xs text-slate-400 mt-1">ID: {cert.id}</p>
                            </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 border border-green-300 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={14} /> Sent
                      </span>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={16} />
                        <p className="text-sm">{cert.issuedDate}</p>
                      </div>
                      <div className="text-sm text-slate-500">Status: <span className="font-semibold text-slate-700">{cert.status || 'Sent'}</span></div>
                    </div>

                    <div className="mb-4">
                      <p className="text-slate-700 text-sm mb-2">Certificate Type</p>
                      <div className="inline-block bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-xs text-slate-600">{certType?.name}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadCertificate(cert)}
                        className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700 rounded-lg transition-all font-semibold text-sm flex items-center justify-center gap-2 group-hover:shadow-md"
                      >
                        <Download size={16} /> Download
                      </button>
                      <button
                        onClick={() => handleDeleteCertificate(cert)}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 rounded-lg transition-all font-semibold text-sm flex items-center justify-center gap-2 group-hover:shadow-md disabled:opacity-50"
                      >
                        <X size={16} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
