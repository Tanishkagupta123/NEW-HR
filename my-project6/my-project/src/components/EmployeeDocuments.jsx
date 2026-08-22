import { API_BASE_URL } from '../config/api';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/ASGROUP-logo.webp';

const documents = [
  {
    title: 'Offer Letter',
    path: '/admin/employee-documents/offer-letter',
    description: 'Jab employee ko job offer ki jaati hai.'
  },
  {
    title: 'Joining Letter',
    path: '/admin/employee-documents/joining-letter',
    description: 'Jab employee company join kar leta hai.'
  },
  {
    title: 'Internship Offer Letter',
    path: '/admin/employee-documents/internship-offer-letter',
    description: 'Naye intern ke liye internship offer letter create karein.'
  },
  {
    title: 'Experience Letter',
    path: '/admin/employee-documents/experience-letter',
    description: 'Jab employee ko experience certificate ki zarurat ho.'
  },
  {
    title: 'Notice Period Letter',
    path: '/admin/employee-documents/notice-period-letter',
    description: 'Jab employee ke notice period details confirm karne ho.'
  },
  {
    title: 'Payment Receipt',
    path: '/admin/employee-documents/receipt',
    description: 'Client payment receipt (AS GROUP Purple Modern Receipt Template).'
  }
];

const documentTitles = {
  offer: 'Offer Letter',
  joining: 'Joining Letter',
  internship: 'Internship Offer Letter',
  experience: 'Experience Letter',
  notice: 'Notice Period Letter',
  receipt: 'Payment Receipt'
};

const requiredKeys = {
  offer: ['candidateName', 'emailAddress', 'candidateAddress', 'position', 'department', 'employmentType', 'salaryPackage', 'joiningDate', 'reportingTime', 'reportingManager', 'offerValidTill'],
  internship: ['candidateName', 'emailAddress', 'position', 'department', 'joiningDate', 'internshipDuration', 'stipend', 'reportingManager', 'mentor'],
  joining: ['employeeName', 'emailAddress', 'employeeId', 'employeeAddress', 'designation', 'department', 'dateOfJoining', 'workLocation', 'reportingManager', 'employmentType', 'monthlySalary', 'reportingTime'],
  experience: ['employeeName', 'emailAddress', 'designation', 'joiningDate', 'lastWorkingDate'],
  notice: ['employeeName', 'emailAddress', 'noticeStartDate', 'lastWorkingDate', 'noticePeriodDuration', 'reportingManager'],
  receipt: ['clientName', 'projectName', 'receiptNo', 'totalProjectCost', 'advanceReceived']
};

const documentForms = {
  offer: {
    subtitle: 'New candidate ke liye offer letter create karein.',
    fields: [
      { label: 'Candidate Name', key: 'candidateName' },
      { label: 'Email Address', key: 'emailAddress', type: 'email' },
      { label: 'Candidate Address', key: 'candidateAddress' },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Employment Type', key: 'employmentType' },
      { label: 'Joining Date', key: 'joiningDate', type: 'date' },
      { label: 'Salary Package', key: 'salaryPackage' },
      { label: 'Reporting Time', key: 'reportingTime', placeholder: '09:30 AM' },
      { label: 'Reporting Manager', key: 'reportingManager' },
      { label: 'Offer Valid Till', key: 'offerValidTill', type: 'date' }
    ],
    preview: [
      'We are pleased to offer you the position mentioned above.',
      'This offer includes the salary package and joining details entered in this form.',
      'Please confirm your acceptance before the offer valid date.'
    ]
  },
  joining: {
    subtitle: 'Employee ke company join karne ke baad joining letter create karein.',
    fields: [
      { label: 'Employee Name', key: 'employeeName' },
      { label: 'Email Address', key: 'emailAddress', type: 'email' },
      { label: 'Employee ID', key: 'employeeId' },
      { label: 'Employee Address', key: 'employeeAddress' },
      { label: 'Designation', key: 'designation' },
      { label: 'Department', key: 'department' },
      { label: 'Date of Joining', key: 'dateOfJoining', type: 'date' },
      { label: 'Work Location', key: 'workLocation' },
      { label: 'Reporting Manager', key: 'reportingManager' },
      { label: 'Employment Type', key: 'employmentType' },
      { label: 'Monthly Salary', key: 'monthlySalary' },
      { label: 'Reporting Time', key: 'reportingTime' }
    ],
    preview: [
      'This letter confirms that the employee has joined the company.',
      'The joining details, designation, department, and reporting manager are recorded here.',
      'The employee is expected to follow company policies from the joining date.'
    ]
  },
  internship: {
    subtitle: 'Internship candidate ke liye internship offer letter create karein.',
    fields: [
      { label: 'Candidate Name', key: 'candidateName' },
      { label: 'Email Address', key: 'emailAddress', type: 'email' },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Internship Start Date', key: 'joiningDate', type: 'date' },
      { label: 'Internship Duration', key: 'internshipDuration' },
      { label: 'Stipend', key: 'stipend' },
      { label: 'Reporting Manager', key: 'reportingManager' },
      { label: 'Mentor', key: 'mentor' }
    ],
    preview: [
      'This letter confirms your selection for the internship position at As Group.',
      'Please find your Internship Offer Letter attached with this email.',
      'Kindly confirm your acceptance by replying to this email.'
    ]
  },
  experience: {
    subtitle: 'Current ya former employee ke liye Experience Letter create karein.',
    fields: [
      { label: 'Salutation', key: 'salutation', type: 'select', options: ['Mr.', 'Ms.', 'Mrs.', 'Miss'] },
      { label: 'Employee Name', key: 'employeeName', placeholder: 'e.g. Kaushal Jangid' },
      { label: 'Email Address', key: 'emailAddress', type: 'email' },
      { label: 'Designation', key: 'designation', placeholder: 'e.g. Full Stack Developer' },
      { label: 'Joining Date', key: 'joiningDate', type: 'date' },
      { label: 'Last Working Date', key: 'lastWorkingDate', type: 'date' },
      { label: 'Letter Date', key: 'letterDate', type: 'date' }
    ],
    preview: [
      'TO WHOM IT MAY CONCERN',
      'This is to certify that Mr. Kaushal Jangid was employed with AS GROUP, located at Rasuliya Road, Narmadapuram, Madhya Pradesh, as a Full Stack Developer from 01 June 2025 to 28 February 2026.',
      'During his tenure, Mr. Kaushal Jangid was responsible for developing, testing, and maintaining web applications and software solutions. He contributed to various projects with dedication and worked collaboratively with the team to deliver quality results.',
      'He has shown strong technical skills, a professional attitude, and a commitment to meeting project deadlines.',
      'We appreciate his contributions to the organization and wish him all the best for his future endeavors.',
      'Best Regards, From AS GROUP'
    ]
  },
  notice: {
    subtitle: 'Employee ke notice period ke liye notice period letter create karein.',
    fields: [
      { label: 'Employee Name', key: 'employeeName' },
      { label: 'Email Address', key: 'emailAddress', type: 'email' },
      { label: 'Notice Start Date', key: 'noticeStartDate', type: 'date' },
      { label: 'Last Working Date', key: 'lastWorkingDate', type: 'date' },
      { label: 'Notice Period Duration', key: 'noticePeriodDuration' },
      { label: 'Reporting Manager', key: 'reportingManager' }
    ],
    preview: [
      'This letter confirms the employee notice period details with the company.',
      'The notice start date, last working date, and reporting manager are recorded here.',
      'The employee is expected to complete handover formalities during the notice period.'
    ]
  },
  receipt: {
    subtitle: 'Client & Project Payment Receipt (AS GROUP Executive Receipt Form).',
    fields: [
      { label: 'Client Name', key: 'clientName', placeholder: 'e.g. Rahul Sharma' },
      { label: 'Project Name', key: 'projectName', placeholder: 'e.g. Web Application Development' },
      { label: 'Receipt No', key: 'receiptNo', placeholder: 'e.g. 108' },
      { label: 'Receipt Date', key: 'receiptDate', type: 'date' },
      { label: 'Total Project Cost (₹)', key: 'totalProjectCost', placeholder: 'e.g. 50000' },
      { label: 'Advance Received (₹)', key: 'advanceReceived', placeholder: 'e.g. 25000' },
      { label: 'Due Payment (₹)', key: 'duePayment', placeholder: 'e.g. 25000' },
      { label: 'Amount in Words', key: 'amountInWords', placeholder: 'e.g. Twenty Five Thousand Rupees Only' },
      { label: 'Payment Mode', key: 'paymentMode', type: 'select', options: ['Bank Transfer', 'Online', 'Cash', 'Cheque'] },
      { label: 'Transaction / Ref ID', key: 'transactionId', placeholder: 'e.g. TXN987654321' }
    ],
    preview: [
      'Thank you for your payment to AS GROUP DIGITAL PVT LTD.',
      'Please find your official Payment Receipt attached.',
      'We look forward to a successful association.'
    ]
  }
};

const defaultFieldValues = {
  workLocation: 'AS Group Digital Pvt. Ltd. Rasuliya Road, Agarwal Complex, 2nd Floor, Near Fauzdar Petrol Pump, Narmadapuram, MP – 461001',
  reportingTime: '9:30 AM'
};

export function EmployeeDocumentPage({ type }) {
  const form = documentForms[type];
  const [fields, setFields] = useState({ ...defaultFieldValues });
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFileUrl, setLastFileUrl] = useState(null);
  const [whatsappShareUrl, setWhatsappShareUrl] = useState(null);

  const convertNumberToWords = (amount) => {
    const num = parseInt(amount, 10);
    if (isNaN(num) || num === 0) return 'Zero Rupees Only';
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
    let strAmount = num.toString();
    if (strAmount.length > 9) return 'Amount too large';
    let n = ('000000000' + strAmount).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return 'Rupees ' + str.trim() + ' Only';
  };

  const handleChange = (key, value) => {
    setFields((currentFields) => {
      const updated = { ...currentFields, [key]: value };
      // Auto calculate due payment for receipt if cost and advance are entered
      if (type === 'receipt' && (key === 'totalProjectCost' || key === 'advanceReceived')) {
        const cost = parseFloat((key === 'totalProjectCost' ? value : updated.totalProjectCost) || 0);
        const adv = parseFloat((key === 'advanceReceived' ? value : updated.advanceReceived) || 0);
        if (!isNaN(cost) && !isNaN(adv)) {
          updated.duePayment = (cost - adv).toString();
        }
        
        const amt = updated.totalProjectCost;
        if (amt && !isNaN(amt)) {
          updated.amountInWords = convertNumberToWords(amt);
        } else {
          updated.amountInWords = '';
        }
      }
      return updated;
    });

    setFieldErrors((errors) => {
      const updated = { ...errors };
      delete updated[key];
      return updated;
    });
  };

  const validate = () => {
    const required = requiredKeys[type] || [];
    const errors = {};

    required.forEach((key) => {
      const val = fields[key] ? fields[key].toString().trim() : '';
      if (!val) {
        const label = documentForms[type]?.fields?.find((field) => field.key === key)?.label || key;
        const cleanLabel = label.replace(/\s*\(.*?\)/g, '');
        errors[key] = `${cleanLabel} is required`;
      }
    });

    // Specific Receipt Form Validations
    if (type === 'receipt') {
      const cost = parseFloat(fields.totalProjectCost);
      const advance = parseFloat(fields.advanceReceived);

      if (fields.totalProjectCost && (isNaN(cost) || cost <= 0)) {
        errors.totalProjectCost = 'Total Project Cost must be a valid number greater than 0';
      }

      if (fields.advanceReceived && isNaN(advance)) {
        errors.advanceReceived = 'Advance Received must be a valid number';
      } else if (!isNaN(cost) && !isNaN(advance) && advance > cost) {
        errors.advanceReceived = 'Advance Received cannot be greater than Total Project Cost';
      }
    }

    if (type !== 'receipt' && fields.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.emailAddress)) {
      errors.emailAddress = 'Valid email address is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessages(['Please fill in all required fields marked in red below.']);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSendLetter = async () => {
    setMessages([]);
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/employee-documents/send-letter`, {
        type,
        fields,
        notes
      });

      const fileUrl = response.data?.fileUrl ? `${API_BASE_URL}${response.data.fileUrl}` : null;
      if (fileUrl) setLastFileUrl(fileUrl);

      setMessages([response.data?.message || `${documentTitles[type]} sent successfully`]);
    } catch (error) {
      setMessages([error.response?.data?.message || `Failed to send ${documentTitles[type]}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setMessages([]);
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/employee-documents/send-letter`, {
        type,
        fields,
        notes
      });

      const fileUrl = response.data?.fileUrl ? `${API_BASE_URL}${response.data.fileUrl}` : null;
      if (fileUrl) {
        setLastFileUrl(fileUrl);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.download = `${type}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setMessages([`PDF generated & downloaded successfully!`]);
      } else {
        setMessages(['PDF generated successfully']);
      }
    } catch (error) {
      setMessages([error.response?.data?.message || `Failed to generate PDF`]);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = async () => {
    setMessages([]);
    if (!validate()) return;

    setLoading(true);

    try {
      // 1. Generate PDF on backend
      const response = await axios.post(`${API_BASE_URL}/admin/employee-documents/send-letter`, {
        type,
        fields,
        notes
      });

      const relativeUrl = response.data?.fileUrl;
      const fullUrl = relativeUrl ? `${API_BASE_URL}${relativeUrl}` : null;
      if (fullUrl) setLastFileUrl(fullUrl);

      // 2. Try Web Share API (File Sharing) for Mobile / Supporting Browsers to attach PDF file directly!
      if (fullUrl && navigator.canShare) {
        try {
          const pdfRes = await fetch(fullUrl);
          const blob = await pdfRes.blob();
          const pdfFile = new File([blob], `Payment_Receipt_${fields.receiptNo || 'ASG'}.pdf`, { type: 'application/pdf' });

          if (navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
              files: [pdfFile],
              title: 'PAYMENT RECEIPT - AS GROUP DIGITAL PVT LTD',
              text: `Payment Receipt for ${fields.clientName || 'Client'} - AS GROUP DIGITAL PVT LTD`
            });
            setMessages(['Receipt PDF file shared directly!']);
            return;
          }
        } catch (shareErr) {
          console.warn("Native file sharing failed or cancelled, falling back:", shareErr);
        }
      }

      // 3. Desktop / Web Fallback: Automatically download the PDF file so user can attach it directly, AND open WhatsApp!
      if (fullUrl) {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.target = '_blank';
        link.download = `Payment_Receipt_${fields.receiptNo || 'ASG'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      const client = fields.clientName || fields.employeeName || fields.candidateName || 'Client';
      const project = fields.projectName || 'Project';
      const cost = fields.totalProjectCost || '0';
      const adv = fields.advanceReceived || '0';
      const due = fields.duePayment || '0';
      const mode = fields.paymentMode || 'online';

      let shareText = '';
      if (type === 'receipt') {
        shareText = `*PAYMENT RECEIPT - AS GROUP DIGITAL PVT LTD*\n\n` +
          `👤 *Client Name:* ${client}\n` +
          `📌 *Project Name:* ${project}\n` +
          `🧾 *Receipt No:* ASG/REC/${fields.receiptNo || '108'}\n` +
          `📅 *Date:* ${fields.receiptDate || new Date().toLocaleDateString('en-GB')}\n` +
          `💰 *Total Project Cost:* Rs. ${cost}\n` +
          `💵 *Advance Received:* Rs. ${adv}\n` +
          `⏳ *Due Payment:* Rs. ${due}\n` +
          `💳 *Payment Mode:* ${mode}\n` +
          (fields.transactionId ? `🔢 *Txn ID:* ${fields.transactionId}\n` : '') +
          (fields.amountInWords ? `📝 *Amount in Words:* ${fields.amountInWords}\n` : '') +
          `\nThank you for your payment! We look forward to a successful association.\n\n` +
          (fullUrl ? `📄 *Download Receipt PDF:* ${fullUrl}` : '');
      } else {
        shareText = `*${documentTitles[type]} - AS GROUP DIGITAL PVT LTD*\n\n` +
          `Recipient: ${client}\n` +
          `Date: ${new Date().toLocaleDateString('en-GB')}\n` +
          (fullUrl ? `📄 *Download Document PDF:* ${fullUrl}` : '');
      }

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      setWhatsappShareUrl(whatsappUrl);
      window.open(whatsappUrl, '_blank');
      setMessages(['PDF downloaded! Click the button below to Open WhatsApp, then attach/drop the downloaded PDF file in chat.']);
    } catch (error) {
      setMessages([error.response?.data?.message || 'Failed to generate receipt PDF for WhatsApp']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/admin/employee-documents"
          className="mb-6 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Back to Employee Documents
        </Link>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600">Employee & Client Documents</p>
          <h1 className="mt-2 text-3xl font-black text-violet-950">{documentTitles[type]}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{form.subtitle}</p>
        </div>

        {messages.length > 0 && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
            messages.some((msg) => msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('required') || msg.toLowerCase().includes('invalid'))
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}>
            {messages.map((msg, index) => (
              <div key={index} className="flex flex-wrap items-center justify-between gap-3">
                <span>{msg}</span>
                {whatsappShareUrl && (
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-700"
                  >
                    💬 Open WhatsApp Now
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">{documentTitles[type]} Details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {form.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                  {field.type === 'select' ? (
                    <select
                      value={fields[field.key] || ''}
                      onChange={(event) => handleChange(field.key, event.target.value)}
                      className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 focus:ring-violet-100 ${fieldErrors[field.key] ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-violet-500'}`}
                    >
                      <option value="" disabled>Select {field.label.toLowerCase()}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={fields[field.key] || ''}
                      onChange={(event) => handleChange(field.key, event.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 focus:ring-violet-100 ${fieldErrors[field.key] ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-violet-500'}`}
                    />
                  )}
                  {fieldErrors[field.key] && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors[field.key]}</p>
                  )}
                </label>
              ))}
            </div>

            {type !== 'experience' && type !== 'receipt' && (
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-700">Additional Notes</span>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter additional notes"
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>
            )}

            {/* Action Buttons: Payment Receipt has Save/Download & WhatsApp Share; All other documents have Create & Send Email */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              {type !== 'receipt' ? (
                <button
                  onClick={handleSendLetter}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {loading ? 'Processing...' : `Create & Send Email`}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {loading ? 'Generating...' : `Save / Download PDF`}
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981z"/>
                    </svg>
                    Share on WhatsApp
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HRSignatorySettings() {
  const [hrList, setHrList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRs();
  }, []);

  const fetchHRs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/hrs/list`);
      setHrList(response.data);
    } catch (err) {
      console.error('Failed to fetch HRs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/employees/hrs/set-primary`, { id });
      fetchHRs();
    } catch (err) {
      console.error('Failed to set primary', err);
    }
  };

  const handleDeleteHR = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee from the HR list? (They will still remain in All Employees)")) return;
    try {
      await axios.post(`${API_BASE_URL}/employees/hrs/remove`, { id });
      fetchHRs();
    } catch (err) {
      console.error('Failed to remove HR status', err);
      alert('Failed to remove HR');
    }
  };

  if (loading) return null;

  return (
    <div className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-violet-900">Authorized Signatory (Lead HR) Settings</h2>
      <p className="mb-4 text-sm text-violet-700">Select the HR whose name will appear on all documents and emails.</p>
      
      {hrList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-violet-300 bg-white/50 p-6 text-center">
          <p className="text-sm font-semibold text-violet-600">No HR Employees Found!</p>
          <p className="mt-1 text-xs text-slate-500">Go to All Employees and set someone's department or position to HR first.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {hrList.map((hr) => (
            <div key={hr.id} className={`flex items-center gap-3 rounded-xl border p-4 transition relative group ${hr.is_primary_hr ? 'border-violet-500 bg-white ring-2 ring-violet-200' : 'border-violet-200 bg-white/60 hover:bg-white'}`}>
              <button 
                onClick={() => handleDeleteHR(hr.id)}
                className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600 hover:text-white"
                title="Delete Employee"
              >
                &times;
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                {hr.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800">{hr.name}</p>
                <p className="text-xs text-slate-500">{hr.position || hr.role_position || 'HR'}</p>
              </div>
              <button
                onClick={() => handleSetPrimary(hr.id)}
                disabled={hr.is_primary_hr}
                className={`ml-4 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${hr.is_primary_hr ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {hr.is_primary_hr ? 'Active Lead' : 'Set as Lead'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeDocuments() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-black text-violet-950">Employee & Client Documents</h1>
        </div>

        <HRSignatorySettings />

        <div className="grid gap-4 md:grid-cols-3">
          {documents.map((document) => (
            <Link
              key={document.path}
              to={document.path}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-300 hover:shadow-md"
            >
              <h2 className="text-xl font-bold text-slate-900">{document.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{document.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}





