require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../configer/db');
const fs = require('fs').promises;
const { PDFParse } = require('pdf-parse');
const axios = require('axios');
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 465),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const formatInterviewDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

const sendHiringStatusEmail = async ({ name, email, position, status, interview_date }) => {
  const recipientEmail = String(email || '').trim();
  if (!recipientEmail) throw new Error('Candidate email is missing');

  const formattedDate = interview_date ? formatInterviewDate(interview_date) : null;
  const subject = status === 'Selected'
    ? 'ASGROUP DIGITAL PVT LTD HR | You are selected for interview'
    : status === 'Pending'
      ? 'ASGROUP DIGITAL PVT LTD HR | Application Received'
      : 'ASGROUP DIGITAL PVT LTD HR | Interview Scheduled';

  const headerText = status === 'Selected'
    ? 'You are selected for interview!'
    : status === 'Pending'
      ? 'Application received successfully!'
      : 'Your interview is scheduled';

  const messageText = status === 'Selected'
    ? `Congratulations! You have been selected for the position of <strong>${position || 'the role'}</strong> at ASGROUP DIGITAL PVT LTD.`
    : status === 'Pending'
      ? `Thank you for applying for the position of <strong>${position || 'the role'}</strong> at ASGROUP DIGITAL PVT LTD. We have received your application and our HR team will review it.`
      : `Your interview for the position of <strong>${position || 'the role'}</strong> at ASGROUP DIGITAL PVT LTD has been scheduled.`;

  const interviewInfo = formattedDate ? `
          <p style="font-size: 15px; margin: 0 0 16px;">
            <strong>Interview Date & Time:</strong><br />${formattedDate}
          </p>
  ` : '';

  const body = `
    <div style="font-family: Arial, sans-serif; background: #f4f5fb; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
        <div style="background: linear-gradient(135deg, #5b21b6, #7c3aed); padding: 30px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">ASGROUP DIGITAL PVT LTD</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.88;">Human Resources Department</p>
        </div>
        <div style="padding: 30px; color: #1f2937;">
          <p style="font-size: 16px; margin: 0 0 16px;">Dear ${name || 'Candidate'},</p>
          <p style="font-size: 20px; margin: 0 0 16px; font-weight: bold; color: #111827;">${headerText}</p>
          <p style="font-size: 15px; margin: 0 0 16px; line-height: 1.75;">
            ${messageText}
          </p>
          ${interviewInfo}
          <p style="font-size: 15px; margin: 0 0 24px; line-height: 1.75;">
            Please stay tuned for further updates from our HR team.
          </p>
          <div style="background: #eef2ff; border-left: 4px solid #7c3aed; padding: 16px; border-radius: 10px;">
            <p style="margin: 0; font-size: 14px; color: #4b5563;">
              This message is sent by ASGROUP DIGITAL PVT LTD HR.
            </p>
          </div>
          <p style="font-size: 14px; margin: 24px 0 0; color: #6b7280;">Regards,<br/>ASGROUP DIGITAL PVT LTD HR Team</p>
        </div>
      </div>
    </div>
  `;

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const mailOptions = {
    from: `ASGROUP DIGITAL PVT LTD HR <${fromAddress}>`,
    to: recipientEmail,
    cc: process.env.EMAIL_USER,
    replyTo: fromAddress,
    subject,
    html: body,
  };

  console.log('[hiring-email] Sending email', { to: recipientEmail, from: fromAddress, subject });
  const result = await emailTransporter.sendMail(mailOptions);
  console.log('[hiring-email] Send result', { accepted: result.accepted, rejected: result.rejected, response: result.response });

  const normalizedRecipient = recipientEmail.toLowerCase().trim();
  const acceptedRecipients = Array.isArray(result.accepted) ? result.accepted.map(r => String(r).toLowerCase().trim()) : [];
  if (!acceptedRecipients.includes(normalizedRecipient)) {
    const rejectedRecipients = Array.isArray(result.rejected) ? result.rejected.map(r => String(r).toLowerCase().trim()) : [];
    const emailError = `SMTP did not accept candidate address: ${recipientEmail}. accepted=${JSON.stringify(acceptedRecipients)}, rejected=${JSON.stringify(rejectedRecipients)}`;
    console.error('[hiring-email] Candidate email not accepted:', emailError);
    throw new Error(emailError);
  }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

function extractJson(rawText) {
  if (!rawText) return {};
  let text = rawText.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try { return JSON.parse(text); } catch (_) {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (e) {
      console.error('JSON extraction regex matched but still failed:', e.message);
    }
  }
  console.error('Could not extract valid JSON. Raw text was:', rawText);
  return {};
}

router.post('/apply', upload.single('resume'), async (req, res) => {
  const { name, phone, email, position, message } = req.body;
  const resume = req.file ? req.file.filename : null;

  if (!email) {
    return res.status(400).json({ status: 'Error', message: 'Email is required' });
  }

  // 1. Pehle check karo ki yeh email already apply kar chuka hai ya nahi
  const checkSql = "SELECT id FROM hiring WHERE email = ? LIMIT 1";
  db.query(checkSql, [email], (checkErr, checkResult) => {
    if (checkErr) return res.status(500).json({ status: 'Error', message: checkErr.message });

    if (checkResult.length > 0) {
      return res.status(400).json({
        status: 'Error',
        message: 'This email has already submitted an application. You can only apply once.'
      });
    }

    // 2. Email naya hai, ab insert karo
    const sql = "INSERT INTO hiring (name, phone, email, position, message, resume) VALUES (?,?,?,?,?,?)";
    db.query(sql, [name, phone, email, position, message, resume], async (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
            status: 'Error',
            message: 'This email has already submitted an application. You can only apply once.'
          });
        }
        return res.status(500).json({ status: 'Error', message: err.message });
      }
      const hiringId = result.insertId;
      let emailSent = false;
      let emailError = null;

      try {
        await sendHiringStatusEmail({
          name,
          email,
          position,
          status: 'Pending',
          interview_date: null,
        });
        emailSent = true;
      } catch (appEmailErr) {
        emailError = appEmailErr.message || String(appEmailErr);
        console.error('Hiring apply email error:', appEmailErr);
      }

      if (resume) {
        try {
          const filePath = path.join(__dirname, '..', 'uploads', resume);
          const data = await fs.readFile(filePath);
          let rawText = '';

          if (resume.toLowerCase().endsWith('.pdf')) {
            try {
              const parser = new PDFParse({ data });
              const pdfResult = await parser.getText();
              rawText = pdfResult.text;
              await parser.destroy();
            } catch (e) {
              console.error('pdf-parse FAILED:', e.message);
              rawText = '';
            }
          } else {
            rawText = data.toString('utf8');
          }

          const looksLikeBinaryGarbage = !rawText || rawText.trim().startsWith('%PDF') || rawText.length < 20;
          if (looksLikeBinaryGarbage) {
            console.error('Skipping AI scan — text extraction failed/empty. File:', resume);
            throw new Error('PDF text extraction failed — skipping AI scan');
          }

          if (rawText.length > 15000) rawText = rawText.slice(0, 15000);

          const prompt = `Extract the following fields from the resume text and return ONLY valid JSON, no markdown, no extra text:
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "skills": ["skill1", "skill2", "..."],
  "total_experience_years": 0,
  "experience": "...",
  "education": "...",
  "summary": "..."
}
For "total_experience_years": Calculate the TOTAL professional experience in years as a NUMBER (decimals allowed, e.g. 0.5, 1, 2.5), by adding up ALL internships, jobs, training programs, and work experience mentioned anywhere in the resume. If the person is a fresher/student with no work history at all, use 0. Never leave this as text like "Not specified" — always give your best numeric estimate based on dates/durations mentioned.
Resume Text:
"""${rawText}"""`;

          const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: 'json_object' }
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const rawAiText = groqResponse.data.choices[0].message.content;
          console.log('--- RAW GROQ RESPONSE ---', rawAiText);

          const aiData = extractJson(rawAiText);
          console.log('--- PARSED AI DATA ---', aiData);

          const sortedSkills = Array.isArray(aiData.skills) ? aiData.skills : [];
          const overallExp = Number(aiData.total_experience_years) || 0;
          const level = overallExp <= 2 ? 'Junior' : overallExp <= 5 ? 'Mid-Level' : 'Senior';

          const updateSql = `UPDATE hiring SET extracted_name=?, extracted_email=?, extracted_phone=?, extracted_skills=?, extracted_experience=?, extracted_experience_details=?, extracted_education=?, extracted_summary=?, extracted_level=? WHERE id=?`;
          db.query(updateSql, [
            aiData.name || null, aiData.email || null, aiData.phone || null,
            JSON.stringify(sortedSkills), overallExp, aiData.experience || null,
            aiData.education || null, aiData.summary || null, level, hiringId,
          ], (updErr) => { if (updErr) console.error('AI update error:', updErr); });

        } catch (scanErr) {
          console.error('Resume AI scan failed:', scanErr.message);
        }
      }

      return res.json({ status: "Success", id: hiringId, emailSent, emailError });
    });
  });
});

router.get('/all', (req, res) => {
    db.query("SELECT * FROM hiring ORDER BY id DESC", (err, result) => {
        if(err) return res.status(500).json({ error: err });
        return res.json(result);
    });
});

router.put('/update-status/:id', (req, res) => {
    const { id } = req.params;
    const { status, interview_date } = req.body;
    const normalizedStatus = (status || 'Pending').trim();
    const requiresDate = normalizedStatus === 'Interview Scheduled' || normalizedStatus === 'Selected';

    if (requiresDate && !interview_date) {
        return res.status(400).json({ error: 'Interview date/time is required for the selected status.' });
    }

    db.query('SELECT name, email, position FROM hiring WHERE id = ?', [id], (selectErr, selectResult) => {
      if (selectErr) return res.status(500).json({ error: selectErr });
      if (!selectResult || selectResult.length === 0) return res.status(404).json({ error: 'Not found' });

      const candidate = selectResult[0];

      db.query(
        'UPDATE hiring SET status=?, interview_date=? WHERE id = ?',
        [normalizedStatus, requiresDate ? interview_date : null, id],
        async (err, result) => {
          if (err) return res.status(500).json({ error: err });
          if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });

          let emailSent = true;
          let emailError = null;
          if (requiresDate) {
            console.log('[hiring-email] Preparing to send status email', {
              id,
              candidateEmail: candidate.email,
              candidateName: candidate.name,
              status: normalizedStatus,
              interview_date,
            });
            try {
              await sendHiringStatusEmail({
                name: candidate.name,
                email: candidate.email,
                position: candidate.position,
                status: normalizedStatus,
                interview_date,
              });
            } catch (emailErr) {
              console.error('Hiring email send error:', emailErr);
              emailSent = false;
              emailError = emailErr.message || String(emailErr);
            }
          }

          return res.json({ status: 'Updated', emailSent, emailError });
        }
      );
    });
});

module.exports = router;

