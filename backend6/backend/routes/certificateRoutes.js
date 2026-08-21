const express = require('express');
const router = express.Router();
const db = require('../configer/db');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Try to locate frontend logo (used in PDF and email)
const frontendLogoPath = path.resolve(__dirname, '../assets/as-group-logo.jpeg');
const directorStampPath = path.join(__dirname, '../assets/asgroup-director-stamp.png');

// Robust Email Transporter for Hostinger / Gmail
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

async function sendCertificateEmail(mailOptions) {
  try {
    return await createTransporter(465, true).sendMail(mailOptions);
  } catch (firstErr) {
    console.warn('[certificate/send-mail] Port 465 failed, trying port 587...', firstErr.message);
    try {
      return await createTransporter(587, false).sendMail(mailOptions);
    } catch (secondErr) {
      throw secondErr;
    }
  }
}

// GET: Fetch all issued certificates
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      c.id,
      c.recipient_name,
      c.recipient_email,
      c.issued_date,
      c.status,
      c.file_path,
      COALESCE(ct.name, 'Certificate') AS certificate_type
    FROM certificates c
    LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
    ORDER BY c.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('[certificate/get-all] Error:', err);
      return res.status(500).json({ error: 'Database error fetching certificates' });
    }
    res.json(results || []);
  });
});

// Generate Certificate PDF (Returns in-memory Buffer + optional file save)
const generateCertificatePDF = (recipientName, certificateType, description, companyName = 'AS GROUP DIGITAL PVT LTD', issuedDateStr = null, certId = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        let filepath = null;

        try {
          const uploadsDir = path.join(__dirname, '../uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filename = `certificate_${Date.now()}.pdf`;
          filepath = path.join(uploadsDir, filename);
          fs.writeFileSync(filepath, pdfBuffer);
        } catch (e) {
          console.warn('[certificate] Disk save skipped (permission/path):', e.message);
        }

        resolve({ pdfBuffer, filepath });
      });

      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const violet = '#5B21B6';
      const deepViolet = '#2E1065';
      const gold = '#B88A2D';
      const ink = '#25213A';
      const muted = '#696276';
      const paper = '#FCFBF8';
      const issuedDateFinal = issuedDateStr || new Date().toLocaleDateString('en-GB');
      const certIdFinal = certId || `AS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      const safeDescription = description || 'Issued in recognition of outstanding performance, dedication, and commitment to excellence.';

      // Off-white paper, a violet top band, and a restrained gold/violet frame.
      doc.rect(0, 0, pageWidth, pageHeight).fill(paper);
      doc.rect(0, 0, pageWidth, 23).fill(violet);
      doc.rect(0, 23, pageWidth, 4).fill(gold);
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(1.4).strokeColor(gold).stroke();
      doc.rect(28, 28, pageWidth - 56, pageHeight - 56).lineWidth(0.75).strokeColor('#B9A7E8').stroke();

      // Corner marks
      const corner = 34;
      const cornerLength = 38;
      [[corner, corner], [pageWidth - corner, corner], [corner, pageHeight - corner], [pageWidth - corner, pageHeight - corner]].forEach(([x, y], index) => {
        const horizontal = index % 2 === 0 ? 1 : -1;
        const vertical = index < 2 ? 1 : -1;
        doc.moveTo(x, y).lineTo(x + (horizontal * cornerLength), y).lineTo(x + (horizontal * cornerLength), y + (vertical * 12))
          .lineWidth(1.7).strokeColor(violet).stroke();
      });

      // Brand lockup.
      const logoWidth = 46;
      const logoX = (pageWidth - logoWidth) / 2;
      if (fs.existsSync(frontendLogoPath)) {
        doc.image(frontendLogoPath, logoX, 42, { width: logoWidth, height: 38, fit: [logoWidth, 38] });
      } else {
        doc.polygon([pageWidth / 2, 43], [pageWidth / 2 - 18, 78], [pageWidth / 2 + 18, 78]).fill(violet);
        doc.polygon([pageWidth / 2, 52], [pageWidth / 2 - 8, 75], [pageWidth / 2 + 8, 75]).fill(paper);
      }
      doc.font('Helvetica-Bold').fontSize(16).fillColor(ink).text(companyName, 0, 85, { width: pageWidth, align: 'center' });
      doc.font('Helvetica').fontSize(7.5).fillColor(muted).text('HUMAN RESOURCES DEPARTMENT', 0, 105, { width: pageWidth, align: 'center', characterSpacing: 1.4 });

      // Heading
      doc.font('Times-Bold').fontSize(36).fillColor(deepViolet).text('Certificate of Achievement', 0, 137, { width: pageWidth, align: 'center' });
      doc.moveTo((pageWidth - 86) / 2, 184).lineTo((pageWidth + 86) / 2, 184).lineWidth(1.3).strokeColor(gold).stroke();

      doc.font('Helvetica').fontSize(10).fillColor(muted).text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 0, 204, { width: pageWidth, align: 'center', characterSpacing: 1.2 });
      doc.font('Times-BoldItalic').fontSize(30).fillColor(ink).text(recipientName || 'RECIPIENT NAME', 100, 228, { width: pageWidth - 200, align: 'center' });
      doc.moveTo(205, 268).lineTo(pageWidth - 205, 268).lineWidth(0.7).strokeColor('#C9C2D8').stroke();

      doc.font('Helvetica').fontSize(11).fillColor(muted).text('has successfully completed and demonstrated excellence in', 0, 287, { width: pageWidth, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(16).fillColor(violet).text(certificateType || 'ACHIEVEMENT / COURSE TITLE', 100, 309, { width: pageWidth - 200, align: 'center' });
      doc.font('Helvetica').fontSize(10).fillColor(muted).text(safeDescription, 155, 342, { width: pageWidth - 310, align: 'center', lineGap: 3 });

      // Seal
      const sealX = pageWidth / 2;
      const sealY = 445;
      doc.circle(sealX, sealY, 25).lineWidth(1.3).strokeColor(violet).stroke();
      doc.circle(sealX, sealY, 19).lineWidth(0.6).strokeColor(gold).stroke();
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor(violet).text('AS GROUP DIGITAL PVT LTD', sealX - 20, sealY - 7, { width: 40, align: 'center' });
      doc.font('Helvetica').fontSize(5.5).fillColor(gold).text('EXCELLENCE', sealX - 20, sealY + 3, { width: 40, align: 'center' });

      // Official stamp
      const lineY = 469;
      doc.moveTo(pageWidth - 280, lineY).lineTo(pageWidth - 104, lineY).lineWidth(0.8).strokeColor(ink).stroke();

      const stampX = 192;
      const stampY = 469;
      if (fs.existsSync(directorStampPath)) {
        doc.image(directorStampPath, stampX - 45, stampY - 45, { width: 90, height: 90 });
      }

      doc.font('Helvetica-Bold').fontSize(12).fillColor(ink).text(issuedDateFinal, pageWidth - 280, lineY + 5, { width: 176, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(muted).text('DATE ISSUED', pageWidth - 280, lineY + 23, { width: 176, align: 'center', characterSpacing: 0.6 });

      doc.font('Helvetica').fontSize(7.5).fillColor(muted).text(`Certificate ID: ${certIdFinal}`, 43, pageHeight - 48, { width: 260 });
      doc.font('Helvetica-Bold').fontSize(8).fillColor(deepViolet).text(`${companyName}  |  HUMAN RESOURCES DEPARTMENT`, pageWidth - 330, pageHeight - 48, { width: 287, align: 'right', characterSpacing: 0.4 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// POST: Generate and send certificate
router.post('/generate-certificate', async (req, res) => {
  try {
    const { recipientName, recipientEmail, certificateType, description } = req.body;

    if (!recipientName || !recipientEmail || !certificateType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const issuedDate = new Date();
    const issuedDateStr = issuedDate.toLocaleDateString('en-GB');
    const certId = `AS-${issuedDate.getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Generate PDF in memory Buffer
    const { pdfBuffer, filepath } = await generateCertificatePDF(recipientName, certificateType, description, 'AS GROUP DIGITAL PVT LTD', issuedDateStr, certId);

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'hr@asgroup.net.in';

    const attachments = [
      {
        filename: `${recipientName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Certificate.pdf`,
        content: pdfBuffer
      }
    ];

    if (fs.existsSync(frontendLogoPath)) {
      attachments.push({
        filename: 'as-group-logo.jpeg',
        path: frontendLogoPath,
        cid: 'asgrouplogo'
      });
    }

    const mailOptions = {
      from: `"ASGROUP Digital Private Limited" <${fromEmail}>`,
      to: recipientEmail,
      subject: `Your AS GROUP DIGITAL PVT LTD Certificate of Achievement`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f7fb; border-radius: 8px;">
          <div style="background: #ffffff; padding: 28px; border-radius: 8px; text-align: left; box-shadow: 0 4px 18px rgba(0,0,0,0.06);">
            <div style="display:flex; align-items:center; gap:12px;">
              ${fs.existsSync(frontendLogoPath) ? '<img src="cid:asgrouplogo" alt="AS GROUP DIGITAL PVT LTD" style="width:56px;height:56px;border-radius:12px;object-fit:contain;background:#ffffff;border:1px solid #e5e7eb;" />' : ''}
              <div>
                <div style="font-weight:700;color:#1e1b4b;font-size:18px">AS GROUP DIGITAL PVT LTD</div>
                <div style="font-size:12px;color:#6b7280">Human Resources Department</div>
              </div>
            </div>
            <hr style="margin:16px 0;border:none;border-top:1px solid #eef2ff" />
            <h2 style="color:#111827;margin:0 0 8px 0;">Congratulations, ${recipientName}</h2>
            <p style="color:#374151;margin:0 0 12px 0;">We’re excited to issue you this certificate in recognition of your achievement.</p>
            <div style="background:#f8fafc;padding:14px;border-radius:12px;border-left:4px solid #7c3aed;margin:12px 0">
              <div style="font-weight:700;color:#111827;font-size:15px">${certificateType}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:6px">Issued: ${issuedDateStr} · Certificate ID: ${certId}</div>
            </div>
            <p style="color:#374151">Please find your certificate attached as a secure PDF. Download and keep it for your records.</p>
          </div>
        </div>
      `,
      attachments
    };

    // Send email
    await sendCertificateEmail(mailOptions);

    const certificateName = certificateType || 'Certificate';

    const getCertificateTypeId = () => {
      return new Promise((resolve, reject) => {
        db.query('SELECT id FROM certificate_types WHERE name = ?', [certificateName], (err, results) => {
          if (err) return reject(err);
          if (results && results.length > 0) {
            return resolve(results[0].id);
          }

          db.query('INSERT INTO certificate_types (name) VALUES (?)', [certificateName], (insertErr, insertResult) => {
            if (insertErr) return reject(insertErr);
            resolve(insertResult.insertId);
          });
        });
      });
    };

    const typeId = await getCertificateTypeId().catch(() => null);

    const todayDate = new Date().toISOString().slice(0, 10);
    const relativeFilePath = filepath ? `/uploads/${path.basename(filepath)}` : null;

    const insertSql = `
      INSERT INTO certificates (recipient_name, recipient_email, certificate_type_id, issued_date, status, file_path)
      VALUES (?, ?, ?, ?, 'Generated', ?)
    `;

    db.query(insertSql, [recipientName, recipientEmail, typeId, todayDate, relativeFilePath], (dbErr, dbResult) => {
      if (dbErr) {
        console.error('[certificate] DB Insert Error:', dbErr);
        return res.status(200).json({
          message: 'Certificate generated and emailed successfully!',
          certCode: certId
        });
      }

      res.status(200).json({
        message: 'Certificate generated and emailed successfully!',
        certificateId: dbResult.insertId,
        certCode: certId
      });
    });

  } catch (error) {
    console.error('[certificate/generate-certificate] Error:', error);
    res.status(500).json({ message: 'Failed to generate certificate', error: error.message });
  }
});

// DELETE: Delete a certificate
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM certificates WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('[certificate/delete] Error:', err);
      return res.status(500).json({ error: 'Database error deleting certificate' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ message: 'Certificate deleted successfully' });
  });
});

module.exports = router;
