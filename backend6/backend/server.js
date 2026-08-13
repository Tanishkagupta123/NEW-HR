require('dotenv').config(); 
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenAI } = require('@google/genai');

const db = require("./configer/db");
const dashboardRoutes = require("./routes/dashboardRoutes");
const payrollRoutes = require('./routes/payrollRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const chatController = require('./controllers/chatController');

const app = express();

// Ensure uploads directory exists on server startup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use('/uploads', express.static(uploadsDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// Mount modular routes
app.use('/admin', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/employees', require('./routes/employeeRoutes'));
app.use('/tasks', require('./routes/taskRoutes'));
app.use('/admin/chat', require('./routes/chatRoutes'));
app.use("/dashboard", dashboardRoutes);
app.use('/leaves', require('./routes/leaveRoutes'));
app.use('/holidays', require('./routes/holidaysRoutes'));
app.use('/payroll', payrollRoutes);
app.use('/payslip', payslipRoutes);
app.use('/attendance', require('./routes/attendanceRoutes'));

// HIRING SYSTEM ROUTES
const hiringRoutes = require('./routes/hiringRoutes');
app.use('/hiring', hiringRoutes);
// KPI routes
const kpiRoutes = require('./routes/kpiRoutes');
app.use('/kpi', kpiRoutes);
// HR Assistant routes
const hrAssistantRoutes = require('./routes/hrAssistantRoutes');
app.use('/hr-assistant', hrAssistantRoutes);
// Certificate routes
const certificateRoutes = require('./routes/certificateRoutes');
app.use('/admin/certificates', certificateRoutes);
app.use('/admin/employee-documents', require('./routes/employeeDocumentRoutes'));

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || '' });

app.post('/api/chatbot/ask', async (req, res) => {
  const { question, userType, empId } = req.body;
  const text = (question || '').toString().trim();

  if (!text) {
    return res.status(400).json({ error: 'Question required' });
  }

  try {
    let context = "Tum ek professional HR Assistant ho.";

    if (userType === 'EMPLOYEE' && empId) {
      const [rows] = await db.promise().query('SELECT name, leaves_left FROM employees WHERE id = ?', [empId]);

      if (rows && rows.length > 0) {
        context += ` Employee Details: ${JSON.stringify(rows[0])}.`;
      } else {
        context += " Employee ka data nahi mila.";
      }
    } else if (userType === 'ADMIN') {
      context += " Tum hiring manager ki madad kar rahe ho.";
    }

    const interaction = await genAI.interactions.create({
      model: "gemini-3.5-flash",
      input: `${context}. Sawal: ${question}`,
    });

    console.log(interaction.output_text);

    res.json({ answer: interaction.output_text });
  } catch (error) {
    console.error("ASAL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Performance management routes
const performanceRoutes = require('./routes/performanceRoutes');
app.use('/admin/performance-management', performanceRoutes);
// Notice routes
const noticeRoutes = require('./routes/noticeRoutes');
app.use('/admin/communication-system/notice', noticeRoutes);
// Announcement routes
const announcementRoutes = require('./routes/announcementRoutes');
app.use('/admin/communication-system/announcement', announcementRoutes);
// Email routes
const emailRoutes = require('./routes/emailRoutes');
app.use('/admin/communication-system/email', emailRoutes);

// Serve static React build and SPA fallback (Fixes "Cannot GET /admin" on refresh)
const distPath = path.join(__dirname, '../my-project/dist');
const publicPath = path.join(__dirname, 'public');
const activeStaticPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(publicPath) ? publicPath : null);

if (activeStaticPath) {
  app.use(express.static(activeStaticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/uploads') || req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(activeStaticPath, 'index.html'));
  });
}

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
global.io = io;

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join', (room) => {
    if (room) socket.join(room);
  });

  socket.on('sendMessage', async (msg) => {
    try {
      const saved = await chatController.saveMessageSocket(msg);
      io.to(msg.room).emit('receiveMessage', saved);
    } catch (err) {
      console.error('Error saving message via socket:', err);
    }
  });
});

// =========================
// SERVER
// =========================
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Choose a different port or stop the conflicting process.`);
  } else {
    console.error('Server error:', err);
  }
});
