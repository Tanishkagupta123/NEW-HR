const express = require('express');
const router = express.Router();
const db = require('../configer/db');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create robust email transporter with IPv4 and timeout options
function createTransporter(port = 465, secure = true) {
  const emailUser = process.env.EMAIL_USER || 'hr@asgroup.net.in';
  const isHostinger = (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('hostinger')) ||
                      (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('hostinger')) ||
                      emailUser.includes('@asgroup.net.in');
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || (isHostinger ? 'smtp.hostinger.com' : 'smtp.gmail.com');

  return nodemailer.createTransport({
    host,
    port: isHostinger ? 465 : port,
    secure: isHostinger ? true : secure,
    auth: {
      user: emailUser,
      pass: process.env.EMAIL_PASSWORD || ''
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    family: 4
  });
}

async function sendPayslipEmail(mailOptions) {
  try {
    return await createTransporter(465, true).sendMail(mailOptions);
  } catch (firstErr) {
    console.warn('[payslip/send-mail] Port 465 failed, trying port 587...', firstErr.message);
    try {
      return await createTransporter(587, false).sendMail(mailOptions);
    } catch (secondErr) {
      throw secondErr;
    }
  }
}

router.get('/all', (req, res) => {
    const { search, month } = req.query;

    let sql = `SELECT payroll.*,
               COALESCE(payroll.email, (SELECT e.email FROM employees e WHERE e.name = payroll.employee_name LIMIT 1)) AS email
               FROM payroll
               WHERE 1=1`;
    let params = [];

    if (month) {
        sql += " AND payroll.month_year = ?";
        params.push(month);
    }
    if (search) {
        sql += " AND payroll.employee_name LIKE ?";
        params.push(`%${search}%`);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('[payslip/all] Database error:', err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Resolve Employee Email
async function resolveEmployeeEmail(employeeName, requestBody) {
    if (requestBody.email || requestBody.employeeEmail || requestBody.empEmail) {
        return (requestBody.email || requestBody.employeeEmail || requestBody.empEmail).trim();
    }

    if (!employeeName) return null;

    if (requestBody.id) {
        try {
            const [payrollById] = await db.promise().query('SELECT email FROM payroll WHERE id = ? LIMIT 1', [requestBody.id]);
            if (payrollById && payrollById[0] && payrollById[0].email) {
                console.log('[payslip/send-mail] resolved email from payroll by id:', payrollById[0].email);
                return payrollById[0].email.trim();
            }
        } catch (err) {
            console.error('Error looking up payroll email by id:', err);
        }
    }

    try {
        const [payrollRows] = await db.promise().query('SELECT email FROM payroll WHERE employee_name = ? LIMIT 1', [employeeName]);
        if (payrollRows && payrollRows[0] && payrollRows[0].email) {
            console.log('[payslip/send-mail] resolved email from payroll by name:', payrollRows[0].email);
            return payrollRows[0].email.trim();
        }
    } catch (err) {
        console.error('Error looking up payroll email by name:', err);
    }

    try {
        const [employeeRows] = await db.promise().query("SELECT email FROM employees WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1", [employeeName]);
        if (employeeRows && employeeRows[0] && employeeRows[0].email) {
            console.log('[payslip/send-mail] resolved email from employees by exact name:', employeeRows[0].email);
            return employeeRows[0].email.trim();
        }
    } catch (err) {
        console.error('Error looking up employee email (exact):', err);
    }

    try {
        const [employeeLike] = await db.promise().query('SELECT email FROM employees WHERE name LIKE ? LIMIT 1', [`%${employeeName}%`]);
        if (employeeLike && employeeLike[0] && employeeLike[0].email) {
            console.log('[payslip/send-mail] resolved email from employees by LIKE match:', employeeLike[0].email);
            return employeeLike[0].email.trim();
        }
    } catch (err) {
        console.error('Error looking up employee email (LIKE):', err);
    }

    return null;
}

router.post('/send-mail', async (req, res) => {
    console.log('[payslip/send-mail] payload received:', JSON.stringify(req.body));
    try {
        const {
            employee_name,
            email,
            employee,
            basic_salary,
            house_rent,
            medical,
            travel,
            overtime,
            bonus,
            leave_deduction,
            other_deduction,
            gross_salary,
            net_salary,
            pf,
            esi,
            tax,
        } = req.body;

        const employeeName = (employee_name || employee || req.body.name || '').trim();
        const recipientEmail = await resolveEmployeeEmail(employeeName, req.body);

        if (!employeeName) {
            return res.status(400).json({ error: "Employee name is required" });
        }
        if (!recipientEmail) {
            return res.status(400).json({ error: "Employee email is required" });
        }

        const safeEmpName = employeeName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `payslip_${safeEmpName}_${Date.now()}.pdf`;

        // Generate PDF in memory buffer (No disk permission required!)
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            try {
                const pdfBuffer = Buffer.concat(buffers);
                const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'hr@asgroup.net.in';

                const mailOptions = {
                    from: `"ASGROUP Digital Private Limited" <${fromEmail}>`,
                    to: recipientEmail,
                    subject: `Payslip for ${employeeName}`,
                    text: `Dear ${employeeName},\n\nPlease find attached your payslip for the requested period.\n\nBest regards,\nASGROUP DIGITAL PVT LTD\nHR Department`,
                    attachments: [
                        {
                            filename: fileName,
                            content: pdfBuffer
                        },
                    ],
                };

                await sendPayslipEmail(mailOptions);
                res.json({ message: `Payslip sent successfully to ${recipientEmail}` });
            } catch (mailErr) {
                console.error("[payslip/send-mail] Error sending email:", mailErr);
                res.status(500).json({ error: `Failed to send email: ${mailErr.message}` });
            }
        });

        doc.on('error', (err) => {
            console.error("[payslip/send-mail] Error creating PDF:", err);
            res.status(500).json({ error: `Failed to create PDF: ${err.message}` });
        });

        // PDF Content (Professional format with Logo)
        const logoPath = path.join(__dirname, '../assets/as-group-full-logo-transparent.png');
        if (fs.existsSync(logoPath)) {
            // Center the logo. Page width is approx 612. If logo width is 200, x = (612-200)/2 = 206
            doc.image(logoPath, 206, 15, { width: 200 });
        }
        
        // Separator Line
        doc.moveTo(50, 160).lineTo(550, 160).stroke('#cbd5e1');
        
        // Reset colors and positions
        doc.fillColor('#0f172a');
        doc.y = 175;
        doc.x = 50;

        doc.fontSize(16).font('Helvetica-Bold').text('SALARY SLIP', { align: 'center' }).moveDown(1.5);
        
        // Employee Details
        doc.fontSize(11).font('Helvetica-Bold').text(`Employee Name:`, 50, doc.y, { continued: true }).font('Helvetica').text(` ${employeeName}`);
        doc.font('Helvetica-Bold').text(`Email ID:`, 50, doc.y + 15, { continued: true }).font('Helvetica').text(` ${recipientEmail}`);
        doc.font('Helvetica-Bold').text(`Salary Month:`, 50, doc.y + 15, { continued: true }).font('Helvetica').text(` ${req.body.month_year || 'Current Month'}`);
        doc.font('Helvetica-Bold').text(`Date Generated:`, 50, doc.y + 15, { continued: true }).font('Helvetica').text(` ${new Date().toLocaleDateString('en-GB')}`);
        
        doc.moveDown(2);
        
        // EARNINGS
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#4c1d95').text('EARNINGS', 50, doc.y, { underline: true }).moveDown(0.5);
        doc.fillColor('#000000');
        doc.fontSize(11).font('Helvetica').text(`Basic Salary: Rs. ${basic_salary || 0}`);
        if (Number(house_rent) > 0) doc.text(`House Rent Allowance (HRA): Rs. ${house_rent}`);
        if (Number(medical) > 0) doc.text(`Medical Allowance: Rs. ${medical}`);
        if (Number(travel) > 0) doc.text(`Travel Allowance: Rs. ${travel}`);
        if (Number(overtime) > 0) doc.text(`Overtime: Rs. ${overtime}`);
        if (Number(bonus) > 0) doc.text(`Bonus: Rs. ${bonus}`);
        doc.moveDown(1.5);

        // DEDUCTIONS
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('DEDUCTIONS', { underline: true }).moveDown(0.5);
        doc.fillColor('#000000');
        doc.fontSize(11).font('Helvetica');
        if (Number(pf) > 0) doc.text(`Provident Fund (PF): Rs. ${pf}`);
        if (Number(esi) > 0) doc.text(`Employee State Insurance (ESI): Rs. ${esi}`);
        if (Number(tax) > 0) doc.text(`Income Tax: Rs. ${tax}`);
        if (Number(req.body.absent_days) > 0 || Number(req.body.half_days) > 0 || Number(req.body.late_fines) > 0) {
            doc.text(`Absents: ${req.body.absent_days || 0} days | Half Days: ${req.body.half_days || 0} | Fines: ${req.body.late_fines || 0}`);
        }
        if (Number(leave_deduction) > 0) doc.text(`Total Leave Deductions: Rs. ${leave_deduction}`);
        if (Number(other_deduction) > 0) doc.text(`Other Deductions: Rs. ${other_deduction}`);
        doc.moveDown(1.5);

        // SUMMARY
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cbd5e1');
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('SUMMARY', { underline: true }).moveDown(0.5);
        doc.font('Helvetica').text(`Gross Salary: Rs. ${gross_salary || 0}`);
        doc.moveDown(0.5);
        
        doc.fontSize(13).font('Helvetica-Bold').text(`NET SALARY: Rs. ${net_salary || 0}`).moveDown(1);
        
        doc.moveDown(1.5);
        doc.fillColor('#94a3b8').fontSize(9).font('Helvetica-Oblique').text('This is a computer-generated document from ASGROUP DIGITAL PVT LTD and does not require a signature.', 50);
        doc.end();

    } catch (err) {
        console.error("[payslip/send-mail] Internal Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

module.exports = router;