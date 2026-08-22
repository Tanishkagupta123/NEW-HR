const express = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../uploads/employee-documents');
const logoPath = path.resolve(__dirname, '../assets/as-group-logo-transparent.png');
const legacyLogoPath = path.resolve(__dirname, '../assets/as-group-logo.jpeg');
const offerLogoPath = path.resolve(__dirname, '../assets/as-group-full-logo-transparent.png');
const backupLogoPath = path.resolve(__dirname, '../../my-project/src/assets/as group logo.jpeg');

function createEmailTransporter(port, secure) {
  const emailUser = process.env.EMAIL_USER || '';
  const isHostinger = process.env.SMTP_HOST ? process.env.SMTP_HOST.includes('hostinger') : emailUser.includes('@asgroup.net.in');
  const host = process.env.SMTP_HOST || (isHostinger ? 'smtp.hostinger.com' : 'smtp.gmail.com');

  return nodemailer.createTransport({
    host,
    port: isHostinger ? 465 : port,
    secure: isHostinger ? true : secure,
    auth: {
      user: emailUser || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    family: 4
  });
}

async function sendDocumentEmail(mailOptions) {
  try {
    return await createEmailTransporter(465, true).sendMail(mailOptions);
  } catch (firstError) {
    if (!['ESOCKET', 'ECONNECTION', 'ETIMEDOUT'].includes(firstError.code)) {
      throw firstError;
    }

    try {
      return await createEmailTransporter(587, false).sendMail(mailOptions);
    } catch (secondError) {
      secondError.message = `${secondError.message}. First Gmail SMTP attempt failed with: ${firstError.message}`;
      throw secondError;
    }
  }
}

function getCompanyEmailFooterHtml() {
  return `
    <div style="margin-top: 24px; font-size: 13px; color: #4b5563; line-height: 1.6;">
      <p style="margin: 0 0 4px 0; font-weight: 700;">Company Address:</p>
      <p style="margin: 0;">AS Group Digital Pvt. Ltd</p>
      <p style="margin: 0;">Rasuliya Road, Agarwal Complex, 2nd Floor</p>
      <p style="margin: 0;">Near Fauzdar Petrol Pump, Narmadapuram, MP – 461001</p>
      <p style="margin: 0;">Email: <a href="mailto:info@asgroup.net.in" style="color:#4b5563; text-decoration:none;">info@asgroup.net.in</a> | <a href="mailto:hr@asgroup.net.in" style="color:#4b5563; text-decoration:none;">hr@asgroup.net.in</a></p>
      <p style="margin: 0;">Website: <a href="https://asgroup.net.in/" style="color:#4b5563; text-decoration:none;">https://asgroup.net.in/</a></p>
      <p style="margin: 0;">Phone: <a href="tel:+919109345128" style="color:#4b5563; text-decoration:none;">+91-9109345128</a></p>
    </div>
  `;
}

const letterConfig = {
  offer: {
    title: 'Offer Letter',
    recipientField: 'candidateName',
    emailField: 'emailAddress',
    subject: 'Your Offer Letter from AS GROUP DIGITAL PVT LTD',
    intro: 'We are pleased to offer you an opportunity to join AS GROUP DIGITAL PVT LTD.',
    rows: [
      ['Position', 'position'],
      ['Department', 'department'],
      ['Joining Date', 'joiningDate'],
      ['Salary Package', 'salaryPackage'],
      ['Reporting Manager', 'reportingManager'],
      ['Offer Valid Till', 'offerValidTill']
    ],
    closing: 'Please confirm your acceptance before the offer validity date. We look forward to welcoming you to our team.'
  },
  internship: {
    title: 'Internship Offer Letter',
    recipientField: 'candidateName',
    emailField: 'emailAddress',
    subject: 'Your Internship Offer Letter from AS GROUP DIGITAL PVT LTD',
    intro: 'We are pleased to confirm your selection for the internship position at AS GROUP DIGITAL PVT LTD.',
    rows: [
      ['Position', 'position'],
      ['Department', 'department'],
      ['Internship Start Date', 'joiningDate'],
      ['Internship Duration', 'internshipDuration'],
      ['Stipend', 'stipend'],
      ['Reporting Manager', 'reportingManager'],
      ['Mentor', 'mentor']
    ],
    closing: 'Please confirm your acceptance by replying to this email. We look forward to your contribution during the internship period.'
  },
  joining: {
    title: 'Joining Letter',
    recipientField: 'employeeName',
    emailField: 'emailAddress',
    subject: 'Your Joining Letter from AS GROUP DIGITAL PVT LTD',
    intro: 'This letter confirms your joining with AS GROUP DIGITAL PVT LTD.',
    rows: [
      ['Employee ID', 'employeeId'],
      ['Designation', 'designation'],
      ['Department', 'department'],
      ['Date of Joining', 'dateOfJoining'],
      ['Work Location', 'workLocation'],
      ['Reporting Manager', 'reportingManager'],
      ['Employment Type', 'employmentType']
    ],
    closing: 'You are expected to follow company policies and complete all joining formalities as required by HR.'
  },
  experience: {
    title: 'Experience Letter',
    recipientField: 'employeeName',
    emailField: 'emailAddress',
    subject: 'Your Experience Letter from AS GROUP DIGITAL PVT LTD',
    intro: 'This is to certify the employment experience with AS GROUP DIGITAL PVT LTD.',
    rows: [
      ['Employee ID', 'employeeId'],
      ['Designation', 'designation'],
      ['Department', 'department'],
      ['Joining Date', 'joiningDate'],
      ['Last Working Date', 'lastWorkingDate'],
      ['Total Experience', 'totalExperience'],
      ['Performance Remark', 'performanceRemark']
    ],
    closing: 'We appreciate the contribution made during the employment period and wish success in future assignments.'
  },
  notice: {
    title: 'Notice Period Letter',
    recipientField: 'employeeName',
    emailField: 'emailAddress',
      subject: 'Notice Period Initiation - ASGROUP Digital Private Limited',
    intro: 'This letter confirms the notice period details with AS GROUP DIGITAL PVT LTD.',
    rows: [
      ['Employee ID', 'employeeId'],
      ['Designation', 'designation'],
      ['Department', 'department'],
      ['Resignation Date', 'resignationDate'],
      ['Notice Start Date', 'noticeStartDate'],
      ['Last Working Date', 'lastWorkingDate'],
      ['Notice Period Duration', 'noticePeriodDuration'],
      ['Reporting Manager', 'reportingManager']
    ],
    closing: 'You are expected to complete all handover responsibilities and exit formalities during the notice period.'
  },
  receipt: {
    title: 'Payment Receipt',
    recipientField: 'clientName',
    emailField: 'emailAddress',
    subject: 'Payment Receipt from AS GROUP DIGITAL PVT LTD',
    intro: 'Thank you for your payment to AS GROUP DIGITAL PVT LTD.',
    rows: [
      ['Client Name', 'clientName'],
      ['Project Name', 'projectName'],
      ['Receipt No', 'receiptNo'],
      ['Receipt Date', 'receiptDate'],
      ['Total Project Cost', 'totalProjectCost'],
      ['Advance Received', 'advanceReceived'],
      ['Due Payment', 'duePayment'],
      ['Amount in Words', 'amountInWords'],
      ['Payment Mode', 'paymentMode'],
      ['Transaction ID', 'transactionId']
    ],
    closing: 'Thank you for your payment. We look forward to a successful association.'
  }
};

function value(data, key) {
  return (data[key] || '').toString().trim();
}

function generateLetterPDF(type, fields, notes) {
  return new Promise((resolve, reject) => {
    const config = letterConfig[type];
    const recipientName = value(fields, config.recipientField);
    const filename = `${type}_letter_${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const doc = new PDFDocument({ size: 'A4', margin: (type === 'experience' || type === 'receipt') ? 0 : 54 });
    const stream = fs.createWriteStream(filepath);

    stream.on('finish', () => resolve(filepath));
    stream.on('error', reject);

    doc.pipe(stream);

    if (type === 'receipt') {
      try {
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 35;
        const contentWidth = pageWidth - (margin * 2);

        // Helper function to format currency numbers cleanly
        const formatAmount = (numStr) => {
          if (!numStr) return '0.00';
          const clean = numStr.toString().replace(/[^0-9.]/g, '');
          const num = parseFloat(clean);
          if (isNaN(num)) return numStr;
          return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // 1. Sleek Logo Theme Border Frame
        doc.save();
        doc.lineWidth(1.5).strokeColor('#1E0C42').rect(18, 18, pageWidth - 36, pageHeight - 36).stroke();
        doc.lineWidth(0.5).strokeColor('#8B5CF6').rect(21, 21, pageWidth - 42, pageHeight - 42).stroke();
        doc.restore();

        // 2. HEADER SECTION (Using Real Full Logo: Triangle + ASGROUP Digital Private Limited - Transparent BG)
        const realFullLogoPath = path.join(__dirname, '../assets/as-group-full-logo-transparent.png');
        const resolvedLogoPath = fs.existsSync(realFullLogoPath) ? realFullLogoPath : (fs.existsSync(logoPath) ? logoPath : (fs.existsSync(legacyLogoPath) ? legacyLogoPath : (fs.existsSync(backupLogoPath) ? backupLogoPath : null)));
        
        if (resolvedLogoPath) {
          doc.image(resolvedLogoPath, 30, 30, { width: 200 });
        } else {
          doc.font('Helvetica-Bold').fontSize(22).fillColor('#1E0C42').text('AS GROUP', 35, 40);
          doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#6D28D9').text('DIGITAL PRIVATE LIMITED', 35, 66);
        }

        // Top Right Header Details
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#1E0C42').text('PAYMENT RECEIPT', 310, 49, { align: 'right', width: 248 });

        doc.font('Helvetica').fontSize(9).fillColor('#64748B').text('Receipt No', 400, 73);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#1E0C42').text(`: ASG/REC/${value(fields, 'receiptNo') || '108'}`, 455, 73);

        doc.font('Helvetica').fontSize(9).fillColor('#64748B').text('Date', 400, 89);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#1E0C42').text(`: ${value(fields, 'receiptDate') || new Date().toLocaleDateString('en-GB')}`, 455, 89);

        // Purple Divider Bar - below logo natural height
        doc.save();
        doc.rect(35, 112, contentWidth, 3).fillColor('#6D28D9').fill();
        doc.restore();

        // 3. CLIENT & PROJECT DETAILS CARD (Y: 125 to 215)
        let curY = 125;
        doc.save();
        doc.roundedRect(35, curY, contentWidth, 90, 8).fillColor('#F5F3FF').fill();
        doc.lineWidth(0.8).strokeColor('#DDD6FE').roundedRect(35, curY, contentWidth, 90, 8).stroke();
        doc.restore();

        // Left Column: Client Details
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#6D28D9').text('BILL TO / CLIENT DETAILS', 52, curY + 14);
        doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#1E0C42').text((value(fields, 'clientName') || 'Client Name').toUpperCase(), 52, curY + 32);
        doc.font('Helvetica').fontSize(8.5).fillColor('#4C1D95').text('Status: Payment Received', 52, curY + 54);

        // Vertical Divider
        doc.strokeColor('#C4B5FD').lineWidth(0.6).moveTo(295, curY + 14).lineTo(295, curY + 76).stroke();

        // Right Column: Project Details
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#6D28D9').text('PROJECT & ISSUER DETAILS', 312, curY + 14);
        doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#1E0C42').text((value(fields, 'projectName') || 'Project Name').toUpperCase(), 312, curY + 32);
        doc.font('Helvetica').fontSize(8.5).fillColor('#4C1D95').text('Issued By: AS GROUP DIGITAL PVT LTD', 312, curY + 54);

        // 4. FINANCIAL BREAKDOWN TABLE (Y: 235 to 425)
        curY = 235;

        // Table Header Bar (AS Group Dark Purple Bar)
        doc.save();
        doc.roundedRect(35, curY, contentWidth, 30, 4).fillColor('#1E0C42').fill();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF').text('DESCRIPTION / PAYMENT BREAKDOWN', 52, curY + 10);
        doc.text('AMOUNT (Rs.)', pageWidth - 165, curY + 10, { width: 112, align: 'right' });
        doc.restore();

        const totalCostStr = formatAmount(value(fields, 'totalProjectCost') || '40000');
        const advanceStr = formatAmount(value(fields, 'advanceReceived') || '10000');
        const dueStr = formatAmount(value(fields, 'duePayment') || '30000');

        const items = [
          ['Total Agreed Project Cost', `Rs. ${totalCostStr}`],
          ['Advance Amount Received', `Rs. ${advanceStr}`],
          ['Remaining Balance Due Payment', `Rs. ${dueStr}`]
        ];

        curY += 30;
        items.forEach(([desc, amt], idx) => {
          doc.save();
          if (idx % 2 === 1) doc.rect(35, curY, contentWidth, 34).fillColor('#F8FAFC').fill();
          doc.restore();

          doc.font('Helvetica').fontSize(10).fillColor('#334155').text(desc, 52, curY + 10);
          doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0F172A').text(amt, pageWidth - 165, curY + 10, { width: 112, align: 'right' });
          doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(35, curY + 34).lineTo(pageWidth - 35, curY + 34).stroke();
          curY += 34;
        });

        // Vertical Table Column Divider
        doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(340, 235).lineTo(340, curY).stroke();

        // TOTAL PROJECT COST Bar
        doc.save();
        doc.rect(35, curY, contentWidth, 36).fillColor('#EDE9FE').fill();
        doc.lineWidth(1.2).strokeColor('#6D28D9').rect(35, curY, contentWidth, 36).stroke();
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1E0C42').text('TOTAL PROJECT COST', 170, curY + 11);
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#1E0C42').text(`Rs. ${totalCostStr}`, pageWidth - 165, curY + 11, { width: 112, align: 'right' });
        doc.restore();

        // 5. AMOUNT IN WORDS CARD (Y: 450 to 510)
        curY = 450;
        doc.save();
        doc.roundedRect(35, curY, contentWidth, 54, 6).fillColor('#F5F3FF').fill();
        doc.lineWidth(0.8).strokeColor('#DDD6FE').roundedRect(35, curY, contentWidth, 54, 6).stroke();
        doc.restore();

        // Rs Circle Badge
        doc.save();
        doc.fillColor('#6D28D9').circle(54, curY + 27, 12).fill();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF').text('Rs', 47, curY + 21);
        doc.restore();

        doc.font('Helvetica-Bold').fontSize(9).fillColor('#6D28D9').text('AMOUNT IN WORDS', 75, curY + 12);
        doc.font('Helvetica-Oblique').fontSize(10.5).fillColor('#1E0C42').text(value(fields, 'amountInWords') || 'Rupees Forty Thousand Only', 75, curY + 29);

        // 6. PAYMENT METHOD CARD (Y: 525 to 585)
        curY = 525;
        doc.save();
        doc.roundedRect(35, curY, contentWidth, 54, 6).fillColor('#F5F3FF').fill();
        doc.lineWidth(0.8).strokeColor('#DDD6FE').roundedRect(35, curY, contentWidth, 54, 6).stroke();
        doc.restore();

        doc.font('Helvetica-Bold').fontSize(9).fillColor('#6D28D9').text('PAYMENT METHOD', 52, curY + 12);
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0F172A').text(`Mode: ${value(fields, 'paymentMode') || 'online'}`, 52, curY + 29);

        if (value(fields, 'transactionId')) {
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#6D28D9').text('TRANSACTION REF / TXN ID', 312, curY + 12);
          doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0F172A').text(value(fields, 'transactionId'), 312, curY + 29);
        }

        // 7. REAL AUTHENTIC SIGNATURE & STAMP SECTION (Y: 605 to 720)
        curY = 605;
        const signTop = curY;

        // Left Text
        doc.font('Helvetica').fontSize(9.5).fillColor('#475569').text('Thank you for your payment.', 38, curY + 16);
        doc.font('Helvetica').fontSize(9.5).fillColor('#475569').text('We look forward to a successful association.', 38, curY + 32);

        // Middle Vertical Divider Line
        doc.strokeColor('#1E0C42').lineWidth(1).moveTo(245, signTop).lineTo(245, signTop + 85).stroke();

        // Center: Authorized Signature Title
        doc.font('Helvetica').fontSize(9).fillColor('#64748B').text('Authorised Signature', 260, signTop + 4);

        // REAL HANDWRITTEN CURSIVE "AS Group" SIGNATURE IMAGE
        const asgroupSignaturePath = path.join(__dirname, '../assets/asgroup_signature_transparent.png');
        if (fs.existsSync(asgroupSignaturePath)) {
          doc.image(asgroupSignaturePath, 260, signTop + 14, { width: 100 });
        }
        doc.restore();

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1E0C42').text('AS GROUP DIGITAL PVT LTD', 260, signTop + 62);

        // Right Director Stamp Logo
        const directorStampPath = path.join(__dirname, '../assets/asgroup-director-stamp.png');
        if (fs.existsSync(directorStampPath)) {
          doc.image(directorStampPath, pageWidth - 118, signTop + 2, { width: 75, height: 75 });
        }

        // 8. BOTTOM NOTE BOX (Clean vector info badge without Unicode emoji corruption)
        curY = pageHeight - 65;
        doc.save();
        doc.roundedRect(35, curY, contentWidth, 30, 6).fillColor('#F5F3FF').fill();
        doc.lineWidth(0.8).strokeColor('#DDD6FE').roundedRect(35, curY, contentWidth, 30, 6).stroke();

        // Clean Solid Circle Info Badge
        doc.fillColor('#1E0C42').circle(52, curY + 15, 9).fill();
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text('i', 50, curY + 8);

        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1E0C42').text('NOTE :', 68, curY + 10);
        doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text('This is an official computer-generated receipt and does not require a physical signature.', 106, curY + 10);
        doc.restore();

        doc.end();
      } catch (err) {
        reject(err);
      }
      return;
    }

    if (type === 'offer') {
      try {
        const resolvedLogoPath = fs.existsSync(logoPath) ? logoPath : (fs.existsSync(legacyLogoPath) ? legacyLogoPath : (fs.existsSync(backupLogoPath) ? backupLogoPath : null));
        const formatDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';
        const name = value(fields, 'candidateName');
        const position = value(fields, 'position');
        const department = value(fields, 'department');
        const joiningDate = formatDate(value(fields, 'joiningDate'));
        const validTill = formatDate(value(fields, 'offerValidTill'));
        const manager = value(fields, 'reportingManager');
        const address = value(fields, 'candidateAddress');
        const employmentType = value(fields, 'employmentType');
        const salary = value(fields, 'salaryPackage');
        const reportingTime = value(fields, 'reportingTime');
        const companyAddress = 'AS Group, Rasuliya Road, Agarwal Complex, 2nd Floor, Near Fauzdar Petrol Pump, Narmadapuram, MP – 461001';

        const header = () => {
           const grad = doc.linearGradient(54, 35, 541, 35);
           grad.stop(0, '#82B3FF');
           grad.stop(1, '#DF8BFF');
           doc.save();
           doc.rect(54, 35, 487, 85).fill(grad);
           doc.restore();

           if (fs.existsSync(offerLogoPath)) {
             doc.image(offerLogoPath, 187, 40, { fit: [220, 48], align: 'center', valign: 'center' });
           } else if (resolvedLogoPath) {
             doc.image(resolvedLogoPath, 202, 42, { width: 42, height: 42 });
           }
           doc.font('Times-Bold')
             .fontSize(19)
             .fillColor('#2E1065')
             .text('OFFER LETTER', 54, 89, { width: 487, align: 'center' });
           doc.font('Helvetica-Bold')
             .fontSize(11)
             .fillColor('#000000')
             .text('Welcome to AS Group', 54, 130, { width: 487, align: 'center' });
        };
        const section = (title, y) => {
          doc.rect(54, y, 487, 20).fillColor('#1E1B4B').fill();
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF').text(title, 64, y + 5);
        };
        const line = (label, text, y) => {
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text(`${label}:`, 64, y);
          doc.font('Helvetica').fontSize(8.5).text(text, 185, y, { width: 340 });
        };
        const paragraph = (text, y) => {
          doc.font('Helvetica').fontSize(9).fillColor('#1F2937').text(text, 54, y, { width: 487, lineGap: 3 });
          return y + doc.heightOfString(text, { width: 487, lineGap: 3 });
        };
        const bulletList = (items, y) => {
          items.forEach((item) => {
            doc.font('Helvetica').fontSize(8.7).fillColor('#1F2937').text(`• ${item}`, 64, y, { width: 465, lineGap: 2 });
            y += doc.heightOfString(`• ${item}`, { width: 465, lineGap: 2 }) + 7;
          });
          return y;
        };

        header();
        doc.font('Helvetica').fontSize(9).fillColor('#111827').text(`Date: ${formatDate(new Date().toISOString().slice(0, 10))}`, 54, 145, { width: 487, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(9).text('To:', 54, 165);
        doc.text(name, 54, 179);
        doc.font('Helvetica').text(address || 'Narmadapuram, Madhya Pradesh', 54, 193);
        doc.font('Helvetica-Bold').text(`Dear ${name},`, 54, 222);
        let y = paragraph(`We are delighted to offer you the position of ${position} at AS Group. This offer letter confirms your selection and outlines the terms and details of your employment with the organization.`, 240) + 16;
        section('Offer Details', y); y += 30;
        [['Candidate Name', name], ['Position', position], ['Department', department], ['Employment Type', employmentType], ['Monthly Salary/Package', salary], ['Joining Date', joiningDate], ['Reporting Manager', manager], ['Offer Valid Till', validTill]].forEach(([label, text]) => { line(label, text, y); y += 18; });
        y += 8; section('Joining Details', y); y += 30;
        [['Date of Joining', joiningDate], ['Reporting Time', reportingTime], ['Reporting Location', companyAddress], ['Reporting To', manager]].forEach(([label, text]) => { line(label, text, y); y += label === 'Reporting Location' ? 34 : 18; });

        doc.addPage(); y = 145;
        section('Employment Terms & Conditions', y); y += 30;
        y = bulletList(['Your employment will be governed by the terms and conditions mentioned in this offer letter and the company employment policy.', 'You will be expected to follow all company policies, rules, procedures, and professional standards.', 'The company reserves the right to terminate employment in accordance with applicable company policies and law in case of misconduct, poor performance, attendance issues, or policy violation.', 'Your employment will be subject to satisfactory performance and completion of all joining formalities.', 'The salary/package mentioned above will be subject to applicable company policies and statutory deductions, if applicable.'], y) + 10;
        section('Documents Required on Joining Day', y); y += 30;
        y = paragraph('Please bring the following original documents along with one set of photocopies:', y) + 10;
        y = bulletList(['Signed copy of the Offer Letter', 'Educational certificates and mark sheets', 'Previous employment documents, if applicable', 'Aadhar Card', 'PAN Card', 'Passport-size photographs – 2 copies', 'Bank account details and cancelled cheque', 'Address proof'], y) + 8;
        section('First Day Instructions', y); y += 30;
        bulletList(['Report to the HR Department upon arrival.', 'Complete joining formalities and documentation.', 'Attend the orientation and induction program.', 'Receive your employee ID card and access credentials.'], y);

        doc.addPage(); y = 145;
        section('Important Reminders', y); y += 30;
        [['Working Hours', 'Monday to Saturday, 09:30 AM to 6:00 PM'], ['Lunch Break', '1:00 PM to 1:30 PM'], ['Employment Type', employmentType || 'Full-Time'], ['Dress Code', 'Business casual/professional attire']].forEach(([label, text]) => { line(label, text, y); y += 20; });
        y += 10; section('Additional Notes', y); y += 30;
        y = paragraph(notes.trim() || 'This offer is subject to successful completion of the joining formalities and submission/verification of the required documents. You are expected to maintain professional conduct and comply with all applicable company policies during your employment.', y) + 15;
        section('Acceptance of Offer', y); y += 30;
        y = paragraph(`Kindly confirm your acceptance of this offer by signing and returning a copy of this letter on or before ${validTill}.`, y) + 10;
        y = paragraph('Failure to respond within the specified period may result in withdrawal of this offer.', y) + 14;
        y = paragraph('We are excited to have you join AS Group and look forward to a productive and successful journey together.', y) + 10;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Welcome aboard!', 54, y); y += 30;
        doc.font('Helvetica-Bold').fontSize(9).text('Sincerely,', 54, y); y += 18;
        doc.text('Ambika Malviya', 54, y); y += 14;
        doc.font('Helvetica').fontSize(8.5).text('Human Resources Manager', 54, y); y += 14;
        doc.font('Helvetica-Bold').text('AS Group', 54, y);
        doc.font('Helvetica').fontSize(8).fillColor('#4B5563').text('hr@asgroup.net.in  |  info@asgroup.net.in  |  +91-9109345128', 54, 770, { width: 487, align: 'center' });
        doc.end();
      } catch (err) { reject(err); }
      return;
    }

    if (type === 'joining') {
      try {
        {
          const resolvedLogoPath = fs.existsSync(logoPath) ? logoPath : (fs.existsSync(backupLogoPath) ? backupLogoPath : null);
          const formatDate = (date) => {
            if (!date) return '[Letter Date]';
            const parsedDate = new Date(`${date}T00:00:00`);
            return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          };
          const employeeName = value(fields, 'employeeName') || '[Employee Name]';
          const employeeAddress = value(fields, 'employeeAddress') || '[Employee Address]';
          const companyName = 'AS GROUP DIGITAL PVT. LTD.';
          const designation = value(fields, 'designation') || '[Designation]';
          const department = value(fields, 'department') || '[Department]';
          const joiningDate = formatDate(value(fields, 'dateOfJoining'));
          const emailAddress = value(fields, 'emailAddress') || '[Email Address]';
          const employeeId = value(fields, 'employeeId') || '[Employee ID]';
          const workLocation = value(fields, 'workLocation') || '[Work Location]';
          const reportingManager = value(fields, 'reportingManager') || '[Reporting Manager]';
          const employmentType = value(fields, 'employmentType') || '[Employment Type]';
          const monthlySalary = value(fields, 'monthlySalary') || '[Monthly Salary]';
          const reportingTime = value(fields, 'reportingTime') || '[Reporting Time]';
          const additionalNotes = value({ notes }, 'notes') || '[Additional Notes]';

          const header = () => {
            const gradient = doc.linearGradient(54, 35, 541, 35);
            gradient.stop(0, '#82B3FF');
            gradient.stop(1, '#DF8BFF');
            doc.save();
            doc.rect(54, 35, 487, 85).fill(gradient);
            doc.restore();
            if (fs.existsSync(offerLogoPath)) {
              doc.image(offerLogoPath, 187, 40, { fit: [220, 48], align: 'center', valign: 'center' });
            } else if (resolvedLogoPath) {
              doc.image(resolvedLogoPath, 202, 42, { width: 42, height: 42 });
            }
            doc.font('Times-Bold').fontSize(19).fillColor('#2E1065').text('JOINING LETTER', 54, 89, { width: 487, align: 'center' });
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000').text('Welcome to AS Group', 54, 130, { width: 487, align: 'center' });
          };
          let currentY = 145;
          const paragraph = (text, options = {}) => {
            doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
              .fontSize(options.size || 10)
              .fillColor(options.color || '#374151')
              .text(text, 54, currentY, { width: 487, lineGap: 3, ...options });
            currentY += doc.heightOfString(text, { width: 487, lineGap: 3 }) + (options.gap || 12);
          };
          const detail = (label, text) => {
            const valueText = String(text || '');
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#111827').text(`${label}:`, 64, currentY, { width: 115 });
            doc.font('Helvetica').fontSize(9.5).fillColor('#374151').text(valueText, 185, currentY, { width: 340, lineGap: 2 });
            currentY += Math.max(18, doc.heightOfString(valueText, { width: 340, lineGap: 2 }) + 6);
          };
          const section = (title) => {
            doc.rect(54, currentY, 487, 20).fillColor('#1E1B4B').fill();
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF').text(title, 64, currentY + 5);
            currentY += 30;
          };

          header();
          doc.font('Helvetica').fontSize(10).fillColor('#374151').text(`Date: ${joiningDate}`, 54, currentY);
          currentY += 24;
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('To,', 54, currentY);
          currentY += 16;
          doc.font('Helvetica-Bold').text(employeeName, 54, currentY);
          currentY += 15;
          doc.font('Helvetica').text(employeeAddress, 54, currentY, { width: 360 });
          currentY += doc.heightOfString(employeeAddress, { width: 360 }) + 18;
          paragraph(`Dear ${employeeName},`, { bold: true, gap: 12 });
          paragraph(`We are pleased to confirm your joining with ${companyName}. This letter confirms that you have joined the company for the position of ${designation} in the ${department} department.`);

          section('Joining Details');
          detail('Employee Name', employeeName);
          detail('Email Address', emailAddress);
          detail('Employee ID', employeeId);
          detail('Employee Address', employeeAddress);
          detail('Designation', designation);
          detail('Department', department);
          detail('Date of Joining', joiningDate);
          detail('Work Location', workLocation);
          detail('Reporting Manager', reportingManager);
          detail('Employment Type', employmentType);
          detail('Monthly Salary', `₹${monthlySalary.replace(/^₹/, '')}`);
          detail('Reporting Time', reportingTime);

          doc.addPage();
          currentY = 145;
          section('Joining Confirmation');
          paragraph(`This is to confirm that ${employeeName} has officially joined ${companyName} as ${designation} in the ${department} department with effect from ${joiningDate}.`);
          paragraph("The employee will be responsible for carrying out the duties and responsibilities assigned by the reporting manager and will be required to follow the company's rules, policies, working hours, and professional standards.");

          currentY += 8;
          section('Important Employment Details');
          detail('Working Hours', 'Monday to Saturday, 09:30 AM to 6:00 PM');
          detail('Lunch Break', '1:00 PM to 1:30 PM');
          detail('Reporting Time', reportingTime);
          detail('Work Location', workLocation);
          detail('Employment Type', employmentType);
          detail('Monthly Salary', `₹${monthlySalary.replace(/^₹/, '')}`);

          currentY += 8;
          section('Additional Notes');
          paragraph(additionalNotes);
          paragraph('The employee is expected to maintain professional conduct, follow company policies, maintain confidentiality of company and client information, and complete assigned responsibilities within the required timelines.');
          paragraph(`We welcome ${employeeName} to ${companyName} and look forward to a productive, successful, and long-term association with the organization.`);

          paragraph('Sincerely,', { bold: true, gap: 5 });
          paragraph('Ambika Malviya', { bold: true, gap: 3 });
          paragraph('Human Resources Manager', { gap: 3 });
          paragraph(companyName, { bold: true, gap: 12 });
          doc.font('Helvetica-Bold').fontSize(8).fillColor('#374151').text('AS GROUP DIGITAL PVT. LTD.', 54, 735, { width: 487, align: 'center' });
          doc.font('Helvetica').fontSize(8).fillColor('#4B5563')
            .text('Rasuliya Road, Agarwal Complex, 2nd Floor,', 54, 747, { width: 487, align: 'center' })
            .text('Near Fauzdar Petrol Pump, Narmadapuram, MP - 461001', 54, 759, { width: 487, align: 'center' })
            .text('hr@asgroup.net.in  |  info@asgroup.net.in  |  +91-9109345128  |  https://asgroup.net.in/', 54, 771, { width: 487, align: 'center' });
          doc.end();
          return;
        }
        // --- PAGE 1 ---
        // 1. Gradient Header Banner
        const grad = doc.linearGradient(54, 35, 541, 35);
        grad.stop(0, '#DF8BFF');
        grad.stop(1, '#82B3FF');
        
        doc.save();
        doc.rect(54, 35, 487, 85).fill(grad);
        doc.restore();

          // 2. Centered company mark inside the gradient
        const resolvedLogoPath = fs.existsSync(logoPath) ? logoPath : (fs.existsSync(backupLogoPath) ? backupLogoPath : null);
        if (resolvedLogoPath) {
           doc.image(resolvedLogoPath, 202, 42, { width: 42, height: 42 });
        }
          doc.font('Helvetica-Bold')
            .fontSize(18)
            .fillColor('#000000')
            .text('AS GROUP', 252, 48);
          doc.font('Helvetica')
            .fontSize(5.2)
            .fillColor('#000000')
            .text('TECHNOLOGY THAT TRANSFORMS', 253, 69);

        // 3. Joining Letter Title in Gradient
          doc.font('Times-Bold')
            .fontSize(19)
           .fillColor('#2E1065')
            .text('JOINING LETTER', 54, 89, { align: 'center', width: 487 });

        // 4. Welcome Subheader on White page (just below the banner)
        doc.font('Helvetica-Bold')
            .fontSize(11)
           .fillColor('#000000')
            .text('Welcome to AS Group', 54, 130, { align: 'center', width: 487 });

        // Thin horizontal divider below welcome subheader
        doc.moveTo(54, 145)
           .lineTo(541, 145)
           .lineWidth(0.5)
           .strokeColor('#CCCCCC')
           .stroke();

        // 5. Date & Address
        const dateVal = fields.dateOfJoining ? new Date(fields.dateOfJoining).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) : '01/April/2026';
        
        doc.font('Helvetica')
           .fontSize(9.5)
           .fillColor('#4B5563')
           .text('To:', 54, 160);

        doc.font('Helvetica')
           .fontSize(9.5)
           .fillColor('#4B5563')
           .text(`Date: ${dateVal}`, 350, 160, { align: 'right', width: 191 });

        const empName = fields.employeeName || 'Pawan';
        const empAddr = fields.employeeAddress || 'Narmadapuram, Madhya Pradesh';

        doc.font('Helvetica-Bold')
           .fontSize(9.5)
           .fillColor('#111827')
           .text(empName.toUpperCase(), 54, 172);

        doc.font('Helvetica')
           .fontSize(9.5)
           .fillColor('#4B5563')
           .text(empAddr, 54, 185, { width: 280 });

        // 6. Salutation
        doc.font('Helvetica-Bold')
           .fontSize(9.5)
           .fillColor('#111827')
           .text(`Dear ${empName.toUpperCase()},`, 54, 215);

        // 7. Intro Paragraph
        const dept = fields.department || 'Data operator';
        const desig = fields.designation || 'Team Leader';
        
        doc.font('Helvetica')
           .fontSize(9.5)
           .fillColor('#374151')
           .text('We are delighted to welcome you to AS Group Digital Pvt. Ltd. This letter confirms your acceptance of the position of ', 54, 235, { continue: true, width: 487, lineGap: 3 })
           .font('Helvetica-Bold')
           .text(`${dept} ${desig}`, { continue: true })
           .font('Helvetica')
           .text(' and outlines the details for your joining.');

        let currentY = 275;

        // Function to draw a black banner header
        const drawSectionHeader = (title) => {
          doc.save();
          doc.rect(54, currentY, 487, 20).fillColor('#000000').fill();
          doc.restore();

          doc.font('Helvetica-Bold')
             .fontSize(9.5)
             .fillColor('#FFFFFF')
             .text(title, 64, currentY + 5);

          currentY += 28;
        };

        // Function to draw bullet points with safe wrapping and dynamic height
        const drawBullet = (label, val, isSquare = true) => {
          doc.save();
          if (isSquare) {
            doc.rect(65, currentY + 6, 6, 6).fillColor('#000000').fill();
          } else {
            doc.circle(67, currentY + 8, 3).fillColor('#000000').fill();
          }
          doc.restore();

          // Combine label and value into a single text block to ensure proper wrapping
          const text = (label ? `${label} ${val}`.trim() : (val || ''));

          doc.font('Helvetica')
             .fontSize(9)
             .fillColor('#374151')
             .text(text, 78, currentY, { width: 450, lineGap: 2 });

          const textHeight = doc.heightOfString(text, { width: 450, lineGap: 2 });
          currentY += Math.max(16, textHeight + 6);
        };

        // --- Joining Details Section ---
        drawSectionHeader('Joining Details');
        drawBullet('Date of Joining: ', dateVal);
        drawBullet('Reporting Time: ', fields.reportingTime || '09:30 AM');
        drawBullet('Reporting Location: ', fields.workLocation || 'AS Group Digital Pvt. Ltd, Rasuliya Road, Agarwal Complex, 2nd Floor, Near Fauzdar Petrol Pump, Narmadapuram, MP – 461001');
        drawBullet('Reporting To: ', fields.reportingManager || 'Hiring Manager');
        
        currentY += 10;

        // --- Position Confirmation Section ---
        drawSectionHeader('Position Confirmation');
        drawBullet('Designation: ', fields.designation || 'Team Leader');
        drawBullet('Department: ', fields.department || 'Data operator');
        drawBullet('Employment Type: ', fields.employmentType || 'Full-time');
        const salaryStr = fields.monthlySalary || '18k';
        drawBullet('Monthly Salary: ', `${salaryStr}(subject to statutory deductions)`);

        currentY += 10;

        // --- Documents Required Section ---
        drawSectionHeader('Documents Required on Joining Day');
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor('#374151')
           .text('Please bring the following original documents along with one set of photocopies:', 54, currentY);
        currentY += 16;

        drawBullet(null, 'Signed copy of Offer Letter');
        drawBullet(null, 'Educational certificates and mark sheets');
        drawBullet(null, 'Previous employment documents (if applicable)');
        drawBullet(null, 'Aadhar Card');
        drawBullet(null, 'PAN Card');
        drawBullet(null, 'Passport-size photographs (2 copies)');
        drawBullet(null, 'Bank account details and cancelled cheque');
        drawBullet(null, 'Address proof');

        // --- PAGE 2 ---
        doc.addPage();
        currentY = 45; // Start near the top of Page 2

        // --- First Day Instructions Section ---
        drawSectionHeader('First Day Instructions');
        drawBullet(null, 'Report to the HR Department upon arrival');
        drawBullet(null, 'Complete joining formalities and documentation');
        drawBullet(null, 'Attend orientation and induction program');
        drawBullet(null, 'Receive your employee ID card and access credentials');

        currentY += 10;

        // --- Important Reminders Section ---
        drawSectionHeader('Important Reminders');
        drawBullet('Working Hours: ', 'Monday to Saturday, 09:30 AM to 6:00 PM');
        drawBullet('Lunch Break: ', '1:00 PM to 1:30 PM');
        drawBullet('Trial Period: ', 'First 3 working days');
        drawBullet('Training Period: ', '1 month from date of joining');
        drawBullet('Dress Code: ', 'Business casual/professional attire');

        currentY += 10;

        // --- Salary & Increment Details Section ---
        drawSectionHeader('Salary & Increment Details');
        const cleanSalary = salaryStr.includes('₹') ? salaryStr : `₹${salaryStr}`;
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor('#374151')
           .text(`We are offering you a fixed salary of ${cleanSalary} per month .`, 54, currentY);
        currentY += 16;
        doc.text('Salary revisions and incentives will be applicable as per company evaluation and performance standards.', 54, currentY);
        currentY += 16;
        doc.text('Please note that no paid leave will be provided from the company side during this period. Any leave taken will be considered unpaid leave.', 54, currentY);
        currentY += 24;

        // --- Contact Information Section ---
        drawSectionHeader('Contact Information');
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor('#374151')
           .text('For any queries or assistance, please contact:', 54, currentY);
        currentY += 16;
        drawBullet('Email: ', 'hr@asgroup.net.in');
        drawBullet('Phone: ', '+91-9109345128');

        currentY += 15;

        // Sign-off text block
        doc.font('Helvetica')
           .fontSize(9)
           .fillColor('#374151')
           .text('We are excited to have you join our team and look forward to a productive and successful journey together.', 54, currentY, { width: 487 });
        currentY += 24;

        doc.text('Welcome aboard!', 54, currentY);
        currentY += 20;

        doc.text('Sincerely,', 54, currentY);
        currentY += 15;

        doc.font('Helvetica-Bold')
           .text('Ambika Malviya', 54, currentY);
        currentY += 13;

        doc.font('Helvetica')
           .fillColor('#6B7280')
           .text('Human Resources Manager', 54, currentY);
        currentY += 13;
        doc.text('AS Group Digital Pvt. Ltd', 54, currentY);

        // --- Page 2 Footer Company Address details ---
        const footerY = 730;
        doc.save();
        doc.moveTo(54, footerY - 10)
           .lineTo(541, footerY - 10)
           .lineWidth(0.5)
           .strokeColor('#E5E7EB')
           .stroke();

        doc.font('Helvetica-Bold')
           .fontSize(8.5)
           .fillColor('#374151')
           .text('Company Address:', 54, footerY)
           .font('Helvetica-Bold')
           .text('AS Group Digital Pvt. Ltd', 54, footerY + 11)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text('Rasuliya Road, Agarwal Complex, 2nd Floor', 54, footerY + 22)
           .text('Near Fauzdar Petrol Pump, Narmadapuram, MP – 461001', 54, footerY + 33)
           .text('Email: info@asgroup.net.in | hr@asgroup.net.in', 54, footerY + 44)
           .text('Website: https://asgroup.net.in/', 54, footerY + 55)
           .text('Phone: +91-9109345128', 54, footerY + 66);
        doc.restore();

        doc.end();
      } catch (err) {
        reject(err);
      }
      return;
    }

    if (type === 'internship') {
      try {
        const resolvedLogoPath = fs.existsSync(offerLogoPath) ? offerLogoPath : (fs.existsSync(logoPath) ? logoPath : (fs.existsSync(backupLogoPath) ? backupLogoPath : null));
        const candidateName = value(fields, 'candidateName') || 'Candidate';
        const joiningDate = fields.joiningDate ? new Date(fields.joiningDate).toLocaleDateString('en-GB') : '-';
        const position = value(fields, 'position') || 'Intern';
        const department = value(fields, 'department') || '-';
        const duration = value(fields, 'internshipDuration') || '-';
        const stipend = value(fields, 'stipend') || 'No stipend';
        const manager = value(fields, 'reportingManager') || 'HR Manager';
        const mentor = value(fields, 'mentor') || '-';
        const reportTime = value(fields, 'reportingTime') || '09:30';
        const today = new Date().toLocaleDateString('en-GB');

        doc.save();
        doc.fillColor('#4D7698').moveTo(485, 35).lineTo(541, 35).lineTo(541, 112).closePath().fill();
        doc.fillColor('#4D7698').moveTo(54, 600).lineTo(54, 765).lineTo(150, 765).closePath().fill();
        doc.restore();

        if (resolvedLogoPath) doc.image(resolvedLogoPath, 187, 42, { fit: [220, 48], align: 'center', valign: 'center' });
        doc.font('Helvetica-Bold').fontSize(19).fillColor('#111111')
          .text('OFFER LETTER', 54, 98, { align: 'center', width: 487 });
        doc.moveTo(54, 125).lineTo(541, 125).lineWidth(0.7).strokeColor('#4D7698').stroke();

        doc.font('Helvetica').fontSize(9).fillColor('#111111');
        doc.text(`Date: ${today}`, 74, 140);
        doc.text('To,', 74, 168);
        doc.text(candidateName, 74, 184);
        doc.text('Subject: Offer Letter', 74, 200);
        doc.font('Helvetica-Bold').text(`Dear ${candidateName},`, 74, 220);
        doc.font('Helvetica').text(
          `We are pleased to offer you an internship with AS Group for the role of ${position} in the ${department} department. We believe that your skills, expertise, and enthusiasm will contribute positively to our organization, and we look forward to having you as a valuable member of our team.`,
          74, 238, { width: 447, lineGap: 3 }
        );

        let tableY = 305;
        doc.font('Helvetica-Bold').fontSize(10).text('Internship Details:', 74, tableY - 20);
        const rows = [
          ['Position', position],
          ['Department', department],
          ['Date of Joining', joiningDate],
          ['Employment type', 'Intern'],
          ['Reporting Time', reportTime],
          ['Working Hours', 'Monday to Saturday, 09:30 AM to 6:00 PM'],
          ['Reporting Manager', manager],
          ['Salary', stipend]
        ];
        const labelWidth = 167;
        const valueWidth = 280;
        const rowHeight = 24;
        rows.forEach(([label, rowValue]) => {
          doc.rect(74, tableY, labelWidth, rowHeight).strokeColor('#777777').stroke();
          doc.rect(74 + labelWidth, tableY, valueWidth, rowHeight).strokeColor('#777777').stroke();
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111111').text(label, 81, tableY + 8, { width: labelWidth - 14 });
          doc.font('Helvetica').text(rowValue, 248, tableY + 8, { width: valueWidth - 12 });
          tableY += rowHeight;
        });

        doc.font('Helvetica').fontSize(8).fillColor('#555555').text('Warm regards,', 86, 690);
        doc.font('Times-Italic').fontSize(13).fillColor('#111111').text('Ambika Malviya', 86, 704);
        doc.font('Helvetica-Bold').fontSize(8.5).text('AMBIKA MALVIYA', 86, 724);

        doc.addPage();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text('Terms & Conditions:', 74, 72);
        const terms = [
          ['1. Confidentiality', 'The intern is required to maintain strict confidentiality regarding all company information, client details, documents, and internal data accessed during the internship period.'],
          ['2. Code of Conduct', 'The intern must maintain professionalism, discipline, and follow all company rules, workplace policies, and regulations.'],
          ['3. Attendance & Punctuality', 'Regular attendance and punctuality are mandatory. Reporting after 09:35 AM will be considered late coming, and a deduction of Rs. 50 per occurrence will be applied from the stipend.'],
          ['4. Leave Policy', 'No unplanned leaves will be allowed during the internship period. Any emergency leave must be informed and approved in advance by the reporting supervisor. No paid leaves will be provided during the internship period. Any leave taken will be considered unpaid leave.'],
          ['5. Performance Evaluation', 'The intern\'s performance, attendance, behavior, and assigned tasks will be reviewed periodically. Successful completion of the internship will depend on satisfactory performance and adherence to company policies.'],
          ['6. Termination', 'The company reserves the right to terminate the internship at any time in case of misconduct, repeated late coming, unsatisfactory performance, or violation of company policies. The intern may also discontinue the internship by providing prior written notice to the company.'],
          ['7. Completion Certificate', 'Upon successful completion of the internship and assigned responsibilities, the intern will receive an Internship Completion Certificate from the company.']
        ];
        let termsY = 88;
        terms.forEach(([heading, text]) => {
          doc.font('Helvetica-Bold').fontSize(8.5).text(heading, 74, termsY, { width: 447 });
          termsY += 12;
          doc.font('Helvetica').fontSize(8.5).text(text, 74, termsY, { width: 447, lineGap: 2 });
          termsY += doc.heightOfString(text, { width: 447, lineGap: 2 }) + 9;
        });

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text('Documents Required on Joining', 74, termsY + 8);
        doc.font('Helvetica').fontSize(8.5).fillColor('#333333').text('Please bring the following documents on your joining date:', 74, termsY + 24);

        let docListY = termsY + 44;
        const leftDocs = ['Aadhar Card Copy', 'PAN Card Copy', 'Passport-size Photograph'];
        const rightDocs = ['Educational Certificates', 'Bank Account Details', 'Experience Letter (If Any)'];

        leftDocs.forEach((item, idx) => {
          const itemY = docListY + (idx * 20);
          doc.save();
          doc.circle(80, itemY + 4, 2.5).fillColor('#111111').fill();
          doc.restore();
          doc.font('Helvetica').fontSize(8.5).fillColor('#111111').text(item, 92, itemY);
        });

        rightDocs.forEach((item, idx) => {
          const itemY = docListY + (idx * 20);
          doc.save();
          doc.circle(300, itemY + 4, 2.5).fillColor('#111111').fill();
          doc.restore();
          doc.font('Helvetica').fontSize(8.5).fillColor('#111111').text(item, 312, itemY);
        });

        // Contact Information at bottom
        const contactY = 660;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text('Contact Information', 74, contactY);

        const badgeY = contactY + 18;
        const drawIconBadge = (iconType, text, x) => {
          doc.save();
          doc.rect(x, badgeY, 16, 16).fillColor('#4D7698').fill();

          if (iconType === 'phone') {
            doc.strokeColor('#FFFFFF').fillColor('#FFFFFF').lineWidth(1);
            doc.moveTo(x + 5, badgeY + 5)
               .lineTo(x + 7, badgeY + 5)
               .lineTo(x + 8.5, badgeY + 7)
               .lineTo(x + 7.5, badgeY + 8.5)
               .lineTo(x + 9.5, badgeY + 10.5)
               .lineTo(x + 11, badgeY + 9.5)
               .lineTo(x + 12.5, badgeY + 11)
               .lineTo(x + 11.5, badgeY + 13)
               .bezierCurveTo(x + 8, badgeY + 13, x + 5, badgeY + 10, x + 5, badgeY + 6.5)
               .closePath()
               .fillAndStroke('#FFFFFF', '#FFFFFF');
          } else if (iconType === 'web') {
            doc.strokeColor('#FFFFFF').lineWidth(1);
            doc.circle(x + 8, badgeY + 8, 4.5).stroke();
            doc.moveTo(x + 3.5, badgeY + 8).lineTo(x + 12.5, badgeY + 8).stroke();
            doc.moveTo(x + 8, badgeY + 3.5).lineTo(x + 8, badgeY + 12.5).stroke();
          } else if (iconType === 'email') {
            doc.strokeColor('#FFFFFF').lineWidth(1);
            doc.rect(x + 3.5, badgeY + 5, 9, 6.5).stroke();
            doc.moveTo(x + 3.5, badgeY + 5).lineTo(x + 8, badgeY + 8.5).lineTo(x + 12.5, badgeY + 5).stroke();
          }

          doc.restore();
          doc.font('Helvetica').fontSize(8.5).fillColor('#111111').text(text, x + 22, badgeY + 3);
        };

        drawIconBadge('phone', '+91 6267032814', 74);
        drawIconBadge('web', 'asgroup.net.in', 215);
        drawIconBadge('email', 'hr@asgroup.net.in', 355);

        doc.end();
      } catch (err) {
        reject(err);
      }
      return;
    }

    if (type === 'experience') {
      try {
        const fullLogoPath = path.resolve(__dirname, '../assets/as-group-full-logo-transparent.png');
        const resolvedLogoPath = fs.existsSync(fullLogoPath) ? fullLogoPath : (fs.existsSync(logoPath) ? logoPath : (fs.existsSync(backupLogoPath) ? backupLogoPath : null));
        const stampPath = path.resolve(__dirname, '../assets/asgroup-director-stamp.png');
        
        const rawName = value(fields, 'employeeName') || 'Kaushal Jangid';
        let salutation = value(fields, 'salutation') || 'Mr.';
        let employeeName = rawName;
        if (/^(Mr|Ms|Mrs|Miss)\.?\s/i.test(rawName)) {
          const parts = rawName.split(' ');
          salutation = parts[0];
          employeeName = parts.slice(1).join(' ');
        }
        
        const designation = value(fields, 'designation') || 'Full Stack Developer';
        
        const formatDate = (date, defaultVal = '') => {
          if (!date) return defaultVal;
          const parsedDate = new Date(`${date}T00:00:00`);
          return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'long', year: 'numeric'
          });
        };
        
        const joiningDate = formatDate(value(fields, 'joiningDate'), '01 June 2025');
        const lastWorkingDate = formatDate(value(fields, 'lastWorkingDate'), '28 February 2026');
        
        const letterDateRaw = value(fields, 'letterDate') || new Date().toISOString().slice(0, 10);
        const currentDateFormatted = formatDate(letterDateRaw, '16 JUNE 2026').toUpperCase();

        const pronounCap = salutation.toLowerCase().includes('ms') || salutation.toLowerCase().includes('mrs') || salutation.toLowerCase().includes('miss') ? 'She' : 'He';
        const possessivePronoun = pronounCap === 'She' ? 'her' : 'his';
        const objectivePronoun = pronounCap === 'She' ? 'her' : 'him';

        // Helper function for rendering multi-styled rich text paragraphs seamlessly without line-break bugs
        const drawRichParagraph = (doc, runs, startX, startY, maxWidth, fontSize = 9.5, lineGap = 5) => {
          let curX = startX;
          let curY = startY;
          const fontHeight = fontSize + lineGap;

          runs.forEach(run => {
            doc.font(run.font || 'Helvetica').fontSize(fontSize).fillColor(run.color || '#222222');
            const words = run.text.split(/(\s+)/);
            words.forEach(word => {
              if (!word) return;
              const wWidth = doc.widthOfString(word);
              if (curX + wWidth > startX + maxWidth && curX > startX && word.trim().length > 0) {
                curX = startX;
                curY += fontHeight;
              }
              doc.text(word, curX, curY, { lineBreak: false });
              curX += wWidth;
            });
          });
          return curY + fontHeight;
        };

        // --- Top Decorative Header Geometry ---
        doc.save();
        // Black Top Left Corner
        doc.fillColor('#111827')
           .moveTo(0, 0)
           .lineTo(45, 0)
           .lineTo(0, 25)
           .closePath()
           .fill();

        // Purple Top Header Bar
        doc.fillColor('#3411A6')
           .moveTo(45, 0)
           .lineTo(595, 0)
           .lineTo(595, 20)
           .lineTo(30, 20)
           .closePath()
           .fill();

        // Top Header Accent Line with Notch
        doc.moveTo(50, 105)
           .lineTo(480, 105)
           .lineTo(490, 112)
           .lineTo(545, 112)
           .lineWidth(1.2)
           .strokeColor('#3411A6')
           .stroke();
        doc.restore();

        // --- Header Logo ---
        if (resolvedLogoPath) {
          doc.image(resolvedLogoPath, 50, 40, { height: 48 });
        } else {
          doc.font('Helvetica-Bold').fontSize(18).fillColor('#3411A6').text('AS GROUP', 50, 48);
          doc.font('Helvetica').fontSize(9).fillColor('#4B5563').text('Digital Private Limited', 50, 68);
        }

        // --- Title & Date Section ---
        const titleY = 135;
        doc.font('Helvetica-Bold').fontSize(21).fillColor('#3411A6').text('EXPERIENCE', 50, titleY);
        const expWidth = doc.widthOfString('EXPERIENCE');
        doc.font('Helvetica-Bold').fontSize(21).fillColor('#111827').text('LETTER', 50 + expWidth + 8, titleY);

        // Underline accent below "EXPERIENCE"
        doc.save();
        doc.rect(50, titleY + 26, expWidth, 3.5).fillColor('#3411A6').fill();
        doc.restore();

        // Date right-aligned
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827').text('Date: ', 390, titleY + 12);
        const dateLabelWidth = doc.widthOfString('Date: ');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#3411A6').text(currentDateFormatted, 390 + dateLabelWidth, titleY + 12);

        // --- TO WHOM IT MAY CONCERN ---
        const subHeaderY = 190;
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1F2937')
           .text('TO WHOM IT MAY CONCERN', 50, subHeaderY, { width: 495, align: 'center' });

        // --- Body Paragraphs ---
        let curY = 225;

        // Paragraph 1
        const p1Runs = [
          { text: 'This is to certify that ', font: 'Helvetica', color: '#222222' },
          { text: `${salutation} ${employeeName} `, font: 'Helvetica-Bold', color: '#111827' },
          { text: 'was employed with ', font: 'Helvetica', color: '#222222' },
          { text: 'AS GROUP', font: 'Helvetica-Bold', color: '#111827' },
          { text: ', located at ', font: 'Helvetica', color: '#222222' },
          { text: 'Rasuliya Road, Narmadapuram, Madhya Pradesh', font: 'Helvetica-Bold', color: '#111827' },
          { text: ', as a ', font: 'Helvetica', color: '#222222' },
          { text: `${designation} `, font: 'Helvetica-Bold', color: '#111827' },
          { text: 'from ', font: 'Helvetica', color: '#222222' },
          { text: `${joiningDate} `, font: 'Helvetica-Bold', color: '#3411A6' },
          { text: 'to ', font: 'Helvetica', color: '#222222' },
          { text: `${lastWorkingDate}.`, font: 'Helvetica-Bold', color: '#3411A6' }
        ];

        curY = drawRichParagraph(doc, p1Runs, 50, curY, 495, 9.5, 5) + 10;

        // Paragraph 2
        const p2Runs = [
          { text: `During ${possessivePronoun} tenure, `, font: 'Helvetica', color: '#222222' },
          { text: `${salutation} ${employeeName} `, font: 'Helvetica-Bold', color: '#111827' },
          { text: `was responsible for developing, testing, and maintaining web applications and software solutions. ${pronounCap} contributed to various projects with dedication and worked collaboratively with the team to deliver quality results.`, font: 'Helvetica', color: '#222222' }
        ];

        curY = drawRichParagraph(doc, p2Runs, 50, curY, 495, 9.5, 5) + 10;

        // Paragraph 3
        const p3Runs = [
          { text: `${pronounCap} has shown strong technical skills, a professional attitude, and a commitment to meeting project deadlines.`, font: 'Helvetica', color: '#222222' }
        ];

        curY = drawRichParagraph(doc, p3Runs, 50, curY, 495, 9.5, 5) + 10;

        // Paragraph 4
        const p4Runs = [
          { text: `We appreciate ${possessivePronoun} contributions to the organization and wish ${objectivePronoun} all the best for ${possessivePronoun} future endeavors.`, font: 'Helvetica', color: '#222222' }
        ];

        curY = drawRichParagraph(doc, p4Runs, 50, curY, 495, 9.5, 5) + 18;

        // --- Sign-off Section ---
        const signY = curY;
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text('Best Regards,', 50, signY);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('From AS GROUP', 50, signY + 22);
        doc.font('Helvetica').fontSize(9).fillColor('#333333').text('Rasuliya Road, Narmadapuram,', 50, signY + 40);

        // Director Stamp (right side)
        if (fs.existsSync(stampPath)) {
          doc.image(stampPath, 420, signY - 10, { width: 80, height: 80 });
        }
        // Authorized Signatory label under stamp
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#111827').text('Authorized Signatory', 410, signY + 75, { width: 100, align: 'center' });

        // --- Bottom Footer Bar ---
        doc.save();
        doc.moveTo(50, 755)
           .lineTo(545, 755)
           .lineWidth(0.8)
           .strokeColor('#3411A6')
           .stroke();

        const footerY = 765;
        const footerHeight = 35;
        doc.rect(0, footerY, 595, footerHeight).fillColor('#3411A6').fill();

        // Left black corner cut
        doc.fillColor('#111827')
           .moveTo(0, footerY)
           .lineTo(40, footerY)
           .lineTo(0, footerY + footerHeight)
           .closePath()
           .fill();

        // Right angled corner cut
        doc.fillColor('#1E0B66')
           .moveTo(545, footerY + footerHeight)
           .lineTo(595, footerY + footerHeight)
           .lineTo(595, footerY)
           .closePath()
           .fill();

        // Contact info with vector-drawn icons
        const iconR = 7;

        // --- Email icon (envelope shape) ---
        const emailCx = 75, emailCy = footerY + 17;
        doc.fillColor('#4921BD').circle(emailCx, emailCy, iconR).fill();
        doc.save();
        doc.strokeColor('#FFFFFF').lineWidth(0.7).fillColor('#FFFFFF');
        doc.rect(emailCx - 3.5, emailCy - 2, 7, 4.5).stroke();
        doc.moveTo(emailCx - 3.5, emailCy - 2).lineTo(emailCx, emailCy + 1).lineTo(emailCx + 3.5, emailCy - 2).stroke();
        doc.restore();
        doc.font('Helvetica').fontSize(7).fillColor('#FFFFFF').text('info@asgroup.net.in', 87, footerY + 13, { lineBreak: false });

        doc.strokeColor('#5B2BE2').lineWidth(0.5).moveTo(178, footerY + 8).lineTo(178, footerY + 26).stroke();

        // --- Website icon (globe shape) ---
        const globeCx = 195, globeCy = footerY + 17;
        doc.fillColor('#4921BD').circle(globeCx, globeCy, iconR).fill();
        doc.save();
        doc.strokeColor('#FFFFFF').lineWidth(0.6);
        doc.circle(globeCx, globeCy, 4).stroke();
        doc.moveTo(globeCx - 4, globeCy).lineTo(globeCx + 4, globeCy).stroke();
        doc.moveTo(globeCx, globeCy - 4).lineTo(globeCx, globeCy + 4).stroke();
        // Curved meridian lines
        doc.moveTo(globeCx - 2, globeCy - 3.5).bezierCurveTo(globeCx - 2, globeCy, globeCx - 2, globeCy, globeCx - 2, globeCy + 3.5).stroke();
        doc.moveTo(globeCx + 2, globeCy - 3.5).bezierCurveTo(globeCx + 2, globeCy, globeCx + 2, globeCy, globeCx + 2, globeCy + 3.5).stroke();
        doc.restore();
        doc.font('Helvetica').fontSize(7).fillColor('#FFFFFF').text('asgroup.net.in', 207, footerY + 13, { lineBreak: false });

        doc.strokeColor('#5B2BE2').lineWidth(0.5).moveTo(280, footerY + 8).lineTo(280, footerY + 26).stroke();

        // --- Phone icon (handset shape) ---
        const phoneCx = 297, phoneCy = footerY + 17;
        doc.fillColor('#4921BD').circle(phoneCx, phoneCy, iconR).fill();
        doc.save();
        doc.fillColor('#FFFFFF');
        // Simplified phone handset using path
        doc.moveTo(phoneCx - 3, phoneCy - 3.5)
           .lineTo(phoneCx - 1, phoneCy - 3.5)
           .lineTo(phoneCx - 1, phoneCy - 1.5)
           .bezierCurveTo(phoneCx - 1, phoneCy, phoneCx + 1, phoneCy, phoneCx + 1, phoneCy + 1.5)
           .lineTo(phoneCx + 1, phoneCy + 3.5)
           .lineTo(phoneCx + 3, phoneCy + 3.5)
           .lineTo(phoneCx + 3, phoneCy + 2)
           .lineTo(phoneCx + 1.5, phoneCy + 2)
           .lineTo(phoneCx + 1.5, phoneCy + 1.5)
           .bezierCurveTo(phoneCx + 1.5, phoneCy - 0.5, phoneCx - 1.5, phoneCy + 0.5, phoneCx - 1.5, phoneCy - 1.5)
           .lineTo(phoneCx - 1.5, phoneCy - 2)
           .lineTo(phoneCx - 3, phoneCy - 2)
           .closePath()
           .fill();
        doc.restore();
        doc.font('Helvetica').fontSize(7).fillColor('#FFFFFF').text('+91 6267032814', 309, footerY + 13, { lineBreak: false });

        doc.strokeColor('#5B2BE2').lineWidth(0.5).moveTo(390, footerY + 8).lineTo(390, footerY + 26).stroke();

        // --- Location icon (pin marker shape) ---
        const locCx = 407, locCy = footerY + 17;
        doc.fillColor('#4921BD').circle(locCx, locCy, iconR).fill();
        doc.save();
        doc.fillColor('#FFFFFF');
        // Pin circle head
        doc.circle(locCx, locCy - 1.5, 2.5).fill();
        // Pin point
        doc.moveTo(locCx - 2, locCy + 0.5).lineTo(locCx, locCy + 4).lineTo(locCx + 2, locCy + 0.5).closePath().fill();
        // Inner dot hole
        doc.fillColor('#4921BD').circle(locCx, locCy - 1.5, 1).fill();
        doc.restore();
        doc.font('Helvetica').fontSize(6.5).fillColor('#FFFFFF').text('Rasuliya Road, Narmadapuram,', 419, footerY + 9, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#FFFFFF').text('Madhya Pradesh, India - 461001', 419, footerY + 19, { lineBreak: false });

        doc.restore();

        doc.end();
      } catch (err) {
        reject(err);
      }
      return;
    }

    const resolvedLogoPath = fs.existsSync(logoPath) ? logoPath : (fs.existsSync(backupLogoPath) ? backupLogoPath : null);
    if (resolvedLogoPath) {
      doc.save();
      const grad = doc.linearGradient(54, 35, 541, 35);
      grad.stop(0, '#DF8BFF');
      grad.stop(1, '#82B3FF');
      doc.rect(54, 35, 487, 85).fill(grad);
      doc.restore();
      doc.image(resolvedLogoPath, 270, 42, { width: 42, height: 42 });
    }

    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fillColor('#2E1065')
       .text(config.title, 54, 90, { align: 'center', width: 487 });

    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#000000')
       .text('Welcome to AS Group Digital Pvt. Ltd.', 54, 130, { align: 'center', width: 487 });

    doc.moveTo(54, 145)
       .lineTo(541, 145)
       .lineWidth(0.5)
       .strokeColor('#CCCCCC')
       .stroke();

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    doc.font('Helvetica')
       .fontSize(9.5)
       .fillColor('#4B5563')
       .text('To:', 54, 160);

    doc.font('Helvetica')
       .fontSize(9.5)
       .fillColor('#4B5563')
       .text(`Date: ${formattedDate}`, 350, 160, { align: 'right', width: 191 });

    doc.font('Helvetica-Bold')
       .fontSize(9.5)
       .fillColor('#111827')
       .text(recipientName.toUpperCase() || 'EMPLOYEE', 54, 172);

    doc.font('Helvetica')
       .fontSize(9.5)
       .fillColor('#4B5563')
       .text(value(fields, 'employeeAddress') || 'Narmadapuram, Madhya Pradesh', 54, 185, { width: 280 });

    doc.font('Helvetica-Bold')
       .fontSize(9.5)
       .fillColor('#111827')
       .text(`Dear ${recipientName || 'Employee'},`, 54, 215);

    doc.font('Helvetica')
       .fontSize(9.5)
       .fillColor('#374151')
       .text(config.intro, 54, 235, { width: 487, lineGap: 3 });

    let currentY = 275;

    const drawSectionHeader = (title) => {
      doc.save();
      doc.rect(54, currentY, 487, 20).fillColor('#000000').fill();
      doc.restore();

      doc.font('Helvetica-Bold')
         .fontSize(9.5)
         .fillColor('#FFFFFF')
         .text(title, 64, currentY + 5);

      currentY += 28;
    };

    const drawBullet = (label, val) => {
      doc.save();
      doc.rect(65, currentY + 6, 6, 6).fillColor('#000000').fill();
      doc.restore();

      const text = `${label} ${val}`.trim();
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor('#374151')
         .text(text, 78, currentY, { width: 450, lineGap: 2 });

      const textHeight = doc.heightOfString(text, { width: 450, lineGap: 2 });
      currentY += Math.max(16, textHeight + 6);
    };

    const detailsTitle = type === 'offer'
      ? 'Offer Details'
      : type === 'experience'
      ? 'Experience Details'
      : type === 'notice'
      ? 'Notice Details'
      : 'Details';

    drawSectionHeader(detailsTitle);
    config.rows.forEach(([label, key]) => {
      const rowValue = value(fields, key) || '-';
      drawBullet(`${label}:`, rowValue);
    });

    currentY += 10;
    drawSectionHeader('Additional Information');
    const closingText = config.closing || '';
    doc.font('Helvetica')
       .fontSize(9.5)
       .fillColor('#374151')
       .text(closingText, 54, currentY, { width: 487, lineGap: 3 });
    const closingHeight = doc.heightOfString(closingText, { width: 487, lineGap: 3 });
    currentY += closingHeight + 18;

    if (notes && notes.toString().trim()) {
      const notesText = notes.toString().trim();
      const notesContentHeight = doc.heightOfString(notesText, { width: 457, lineGap: 4 });
      const notesBoxHeight = notesContentHeight + 32;

      doc.save();
      doc.roundedRect(54, currentY, 487, notesBoxHeight, 6).fillColor('#F5F3FF').fill();
      doc.rect(54, currentY, 4, notesBoxHeight).fillColor('#7C3AED').fill();
      doc.restore();

      doc.font('Helvetica-Bold')
         .fontSize(9.5)
         .fillColor('#6D28D9')
         .text('Additional Notes:', 68, currentY + 8);

      doc.font('Helvetica')
         .fontSize(9.5)
         .fillColor('#4B5563')
         .text(notesText, 68, currentY + 22, { width: 457, lineGap: 4 });

      currentY += notesBoxHeight + 22;
    }

    currentY += 10;
    drawSectionHeader('Contact Information');
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#374151')
       .text('For any queries or assistance, please contact:', 54, currentY);
    currentY += 16;
    drawBullet('Email:', 'hr@asgroup.net.in');
    drawBullet('Phone:', '+91-9109345128');

    currentY += 15;
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#374151')
       .text('We are excited to have you join our team and look forward to a productive and successful journey together.', 54, currentY, { width: 487 });
    const conclusionHeight = doc.heightOfString('We are excited to have you join our team and look forward to a productive and successful journey together.', { width: 487 });
    currentY += conclusionHeight + 12;

    doc.font('Helvetica-Bold')
       .fontSize(9.5)
       .fillColor('#111827')
       .text('Sincerely,', 54, currentY);
    currentY += 15;

    doc.font('Helvetica-Bold')
       .fontSize(10)
       .text('Ambika Malviya', 54, currentY);
    currentY += 13;

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#6B7280')
       .text('Human Resources Manager', 54, currentY);
    currentY += 13;
    doc.text('AS Group Digital Pvt. Ltd', 54, currentY);

    doc.moveTo(54, 765).lineTo(541, 765).lineWidth(0.5).strokeColor('#E2E8F0').stroke();
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#94A3B8')
       .text('AS GROUP DIGITAL PVT LTD  |  Human Resources Department', 54, 774);
    doc.font('Helvetica-Bold')
       .fontSize(8)
       .fillColor('#CBD5E1')
       .text('CONFIDENTIAL', 341, 774, { align: 'right', width: 200 });

    doc.end();
  });
}

router.post('/send-letter', async (req, res) => {
  try {
    const { type, fields = {}, notes = '' } = req.body;
    const config = letterConfig[type];

    if (!config) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const recipientName = value(fields, config.recipientField);
    const recipientEmail = value(fields, config.emailField);

    if (!recipientName || (type !== 'receipt' && !recipientEmail)) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (type !== 'receipt' && recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    // Notice-period communication is email-only; do not create or attach a PDF.
    const pdfPath = type === 'notice' ? null : await generateLetterPDF(type, fields, notes);

    // If type is receipt and no email provided or sendEmail is false, return generated PDF link immediately without sending email
    if (type === 'receipt' && (!recipientEmail || req.body.sendEmail === false)) {
      return res.json({
        message: 'Payment Receipt PDF generated successfully!',
        fileUrl: pdfPath ? `/uploads/employee-documents/${path.basename(pdfPath)}` : null
      });
    }

    let emailHtml = '';
    if (type === 'joining') {
      const dateVal = fields.dateOfJoining ? new Date(fields.dateOfJoining).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : '01/April/2026';
      const empName = (fields.employeeName || 'Pawan').toUpperCase();
      const empAddr = fields.employeeAddress || 'Narmadapuram, Madhya Pradesh';
      const dept = fields.department || 'Data operator';
      const desig = fields.designation || 'Team Leader';
      const repTime = fields.reportingTime || '09:30 AM';
      const workLoc = fields.workLocation || 'AS Group Digital Pvt. Ltd, Rasuliya Road, Agarwal Complex, 2nd Floor, Near Fauzdar Petrol Pump, Narmadapuram, MP – 461001';
      const repManager = fields.reportingManager || 'Hiring Manager';
      const empType = fields.employmentType || 'Full-time';
      const salaryStr = fields.monthlySalary || '18k';
      const cleanSalary = salaryStr.includes('₹') ? salaryStr : `₹${salaryStr}`;

      // Plain/simple email body (no boxed card, no logo) — keep only the required text
      emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #111111; font-size: 15px; line-height: 1.65;">
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Dear ${recipientName || empName},</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">We are pleased to inform you that you have been selected to join our company. Your joining date will be ${dateVal}.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Your starting salary will be ${cleanSalary} per month.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Please note that no paid leave will be provided by the company during this period. Any leave taken will be considered Leave Without Pay (LWP).</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">You are requested to report on time with all the required documents on your joining date.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">We look forward to working with you and wish you a successful career with AS Group Digital Pvt. Ltd.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Best Regards,<br/>Ambika Malviya<br/>HR Manager<br/>AS Group Digital Pvt. Ltd.</p>
          ${getCompanyEmailFooterHtml()}
        </div>
      `;
    } else if (type === 'internship') {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #111827;">
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Dear ${recipientName || 'Candidate'},</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">We are pleased to confirm your selection for the internship position at <strong>AS Group Digital Pvt. Ltd.</strong> Congratulations, and welcome to the team!</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Please find your <strong>Internship Offer Letter</strong> attached with this email. Kindly confirm your acceptance by replying to this email.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">We are excited to have you onboard and look forward to your contribution during the internship period. For any queries or clarification, feel free to reach out.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Best Regards,<br/>Ambika Malviya<br/>HR Manager<br/>AS Group Digital Pvt. Ltd.</p>
          ${getCompanyEmailFooterHtml()}
        </div>
      `;
    } else if (type === 'experience') {
      const employeeName = fields.employeeName || recipientName;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #111827;">
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;"><strong>Dear ${employeeName},</strong></p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Greetings from AS Group Digital Pvt. Ltd.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">We would like to express our sincere appreciation for your valuable contributions and dedicated service during your tenure with our organization.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Please find attached your <strong>Experience Letter</strong> for your records and future reference. Your hard work, commitment, and professionalism have been greatly appreciated, and we are grateful for the efforts you have made towards the growth and success of the company.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">We wish you continued success in your future career and personal endeavors. May you achieve greater heights in all your upcoming opportunities.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Best Regards,<br/>Ambika Malviya<br/>HR Manager<br/>AS Group Digital Pvt. Ltd.</p>
          ${getCompanyEmailFooterHtml()}
        </div>
      `;
    } else if (type === 'notice') {
      const employeeName = recipientName;
      const formatNoticeDate = (date) => {
        if (!date) return '-';
        const parsedDate = new Date(`${date}T00:00:00`);
        return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
      };
      const noticeDuration = value(fields, 'noticePeriodDuration');
      const noticeStartDate = formatNoticeDate(value(fields, 'noticeStartDate'));
      const lastWorkingDate = formatNoticeDate(value(fields, 'lastWorkingDate'));
      const reportingManager = value(fields, 'reportingManager');
      const additionalNotes = notes.trim() || '-';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #111827;">
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;"><strong>Dear ${employeeName},</strong></p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">This letter is to inform you that as per the company's employment policy, you are required to serve a notice period of <strong>${noticeDuration}</strong>. Your notice period will commence from <strong>${noticeStartDate}</strong>, and your last working day will be <strong>${lastWorkingDate}</strong>.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Please ensure the completion of all assigned responsibilities, proper work handover, return of company assets (if applicable), and completion of all HR formalities during this period.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Please coordinate with your Reporting Manager <strong>${reportingManager}</strong> and the HR Department for a smooth transition.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 4px 0;"><strong>Additional Notes:</strong></p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; white-space: pre-line;">${additionalNotes}</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Regards,<br/>Ambika Malviya<br/>HR Manager<br/>AS Group Digital Pvt. Ltd.</p>
          ${getCompanyEmailFooterHtml()}
        </div>
      `;
    } else if (type === 'receipt') {
      const clientName = recipientName;
      const projectName = value(fields, 'projectName');
      const receiptNo = value(fields, 'receiptNo');
      const totalCost = value(fields, 'totalProjectCost');
      const advance = value(fields, 'advanceReceived');
      const due = value(fields, 'duePayment');
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #111827;">
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;"><strong>Dear ${clientName},</strong></p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Thank you for your payment to <strong>AS Group Digital Pvt. Ltd.</strong></p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Please find attached your official <strong>Payment Receipt (Receipt No: ASG/REC/${receiptNo})</strong> for <strong>${projectName}</strong>.</p>
          <div style="background: #f8fafc; border-left: 4px solid #6d28d9; padding: 14px; margin: 16px 0; border-radius: 8px;">
            <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Total Project Cost:</strong> ₹${totalCost}</p>
            <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Advance Received:</strong> ₹${advance}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Due Payment:</strong> ₹${due}</p>
          </div>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">We appreciate your business and look forward to a successful association.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Best Regards,<br/>Ambika Malviya<br/>HR & Accounts Manager<br/>AS Group Digital Pvt. Ltd.</p>
          ${getCompanyEmailFooterHtml()}
        </div>
      `;
    } else {
      const position = value(fields, 'position') || 'Team Leader – Data Operator';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #111827; font-size: 15px; line-height: 1.7;">
          <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
          <p style="margin: 0 0 16px 0;">Congratulations! 🎉</p>
          <p style="margin: 0 0 16px 0;">We are pleased to inform you that you have been selected for the position of <strong>${position}</strong> at <strong>AS Group Digital Pvt. Ltd.</strong></p>
          <p style="margin: 0 0 16px 0;">We are delighted to welcome you to our team and look forward to having you contribute to our organization.</p>
          <p style="margin: 0 0 16px 0;">Please find attached your <strong>Offer Letter</strong> containing the details of your position, salary, joining date, and other terms and conditions of employment.</p>
          <p style="margin: 0 0 16px 0;">Kindly review the Offer Letter carefully and confirm your acceptance by signing the document and sharing the signed copy with the HR Department.</p>
          <p style="margin: 0 0 16px 0;">Once we receive your acceptance, the <strong>Joining Letter</strong> and further joining instructions will be shared with you.</p>
          <p style="margin: 0 0 16px 0;">If you have any questions regarding the offer, please feel free to contact us.</p>
          <p style="margin: 0 0 16px 0;">Once again, congratulations on your selection! 🎉</p>
          <p style="margin: 0 0 16px 0;">We look forward to a successful and productive association with you.</p>
          <p style="margin: 0 0 16px 0;">Best Regards,<br/>Ambika Malviya<br/>HR Manager<br/>AS Group Digital Pvt. Ltd.</p>
          ${getCompanyEmailFooterHtml()}
        </div>
      `;
    }

    const attachments = pdfPath ? [{
      filename: `${recipientName.replace(/\s+/g, '_')}_${config.title.replace(/\s+/g, '_')}.pdf`,
      path: pdfPath
    }] : [];

    const emailText = type === 'notice'
      ? `Dear, ${recipientName.toUpperCase()}\n\nThis is to inform you that your notice period has been initiated as per the terms and conditions of your employment with ASGROUP Digital Private Limited.\n\nPlease note that your notice period will be considered completed only after your final salary has been paid in cash by the company and all exit formalities have been successfully completed.\n\nDuring the notice period, you are expected to:\n\n• Complete all pending work and assigned tasks.\n• Provide a proper handover of all ongoing projects and responsibilities.\n• Return all company assets, documents, IDs, and credentials (if applicable).\n• Maintain professional conduct and follow company policies until your last working day.\n\nYour Full & Final Settlement (F&F), Experience Letter, and Relieving Letter (if applicable) will be processed only after the successful completion of your notice period and all company formalities.\n\nWe appreciate your contribution to ASGROUP Digital Private Limited and wish you all the best for your future career.\n\nRegards,\nHR Department\nAMBIKA MALVIYA\nASGROUP Digital Private Limited`
      : undefined;

    const senderAddress = process.env.EMAIL_USER || 'noreply@asgroup.com';
    const mailResult = await sendDocumentEmail({
      from: `"ASGROUP Digital Private Limited" <${senderAddress}>`,
      replyTo: senderAddress,
      to: recipientEmail,
      bcc: senderAddress,
      subject: config.subject,
      // A notice-period email is deliberately plain text: no HTML card, box, or layout.
      html: type === 'notice' ? undefined : emailHtml,
      text: type === 'notice'
        ? `Dear ${recipientName},\n\nThis letter is to inform you that as per the company's employment policy, you are required to serve a notice period of ${value(fields, 'noticePeriodDuration')}. Your notice period will commence from ${value(fields, 'noticeStartDate')}, and your last working day will be ${value(fields, 'lastWorkingDate')}.\n\nPlease ensure the completion of all assigned responsibilities, proper work handover, return of company assets (if applicable), and completion of all HR formalities during this period.\n\nPlease coordinate with your Reporting Manager ${value(fields, 'reportingManager')} and the HR Department for a smooth transition.\n\nAdditional Notes:\n${notes.trim() || '-'}\n\nRegards,\nHR Department\nAS Group Digital Private Limited`
        : emailText,
      attachments
    });
    console.log(`Employee document email accepted for ${recipientEmail}. Message ID: ${mailResult.messageId}`);

    return res.json({
      message: `${config.title} email sent to ${recipientEmail}`,
      fileUrl: pdfPath ? `/uploads/employee-documents/${path.basename(pdfPath)}` : null
    });
  } catch (error) {
    console.error('Employee document send error:', error);
    return res.status(500).json({ message: 'Failed to send employee document', error: error.message });
  }
});

router.post('/send-notice-to-hr', async (req, res) => {
  try {
    const fields = req.body || {};
    const employeeName = value(fields, 'employeeName');
    const employeeEmail = value(fields, 'emailAddress');
    const hrEmail = process.env.HR_EMAIL || process.env.EMAIL_USER;

    if (!employeeName || !employeeEmail) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeEmail)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    if (!hrEmail) {
      return res.status(500).json({ message: 'HR email is not configured' });
    }

    const pdfPath = await generateLetterPDF('notice', fields, fields.reason || '');

    await sendDocumentEmail({
      from: process.env.EMAIL_USER || 'noreply@asgroup.com',
      to: employeeEmail,
      cc: hrEmail && hrEmail !== employeeEmail ? hrEmail : undefined,
      replyTo: employeeEmail,
      subject: `Notice Period Request - ${employeeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #111827;">
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Hello ${employeeName},</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Your notice period request has been submitted successfully. The HR team has been copied on this email for review.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 12px;"><strong>Notice Period Details:</strong></p>
          <ul style="margin: 0 0 16px 18px; padding: 0; color: #334155; font-size: 15px; line-height: 1.7;">
            <li>Employee Name: ${employeeName || '-'}</li>
            <li>Email Address: ${employeeEmail || '-'}</li>
            <li>Employee ID: ${value(fields, 'employeeId') || '-'}</li>
            <li>Department: ${value(fields, 'department') || '-'}</li>
            <li>Designation: ${value(fields, 'designation') || '-'}</li>
            <li>Resignation Date: ${value(fields, 'resignationDate') || '-'}</li>
            <li>Notice Start Date: ${value(fields, 'noticeStartDate') || '-'}</li>
            <li>Last Working Date: ${value(fields, 'lastWorkingDate') || '-'}</li>
            <li>Notice Period Duration: ${value(fields, 'noticePeriodDuration') || '-'}</li>
            <li>Reason / Message: ${value(fields, 'reason') || '-'}</li>
          </ul>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Please refer to the attached PDF for the full notice period letter and keep it for your records.</p>
          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">Regards,<br/>HR Team<br/>AS Group Digital Pvt. Ltd.</p>
          ${getCompanyEmailFooterHtml()}
        </div>
      `,
      attachments: [
        {
          filename: `${employeeName.replace(/\s+/g, '_')}_Notice_Period_Letter.pdf`,
          path: pdfPath
        }
      ]
    });

    return res.json({ message: 'Notice period request with attachment sent to HR successfully' });
  } catch (error) {
    console.error('Notice period HR send error:', error);
    return res.status(500).json({ message: 'Failed to send notice period request to HR', error: error.message });
  }
});

module.exports = router;


