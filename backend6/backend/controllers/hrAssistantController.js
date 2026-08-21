const db = require('../configer/db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'gsk_fallback_key_placeholder' });

exports.status = (req, res) => {
  res.json({
    service: 'HR Assistant Backend',
    status: 'running',
    message: 'HR Assistant backend route is available.'
  });
};

exports.ask = async (req, res) => {
  const { question, userType, empId } = req.body;
  const text = (question || '').toString().trim();

  if (!text) {
    return res.json({
      question: '',
      answer: 'Aapka sawaal prapt nahi hua. Kripya koi valid sawaal bhejein, main turant jawab dunga.'
    });
  }

  const q = text.toLowerCase();
  let contextParts = [];

  try {
    // ---- Employee ka apna basic profile hamesha bhejo agar empId hai ----
    let employeeName = null;
    if (empId) {
      const [empRows] = await db.promise().query(
        'SELECT id, name, email, department, position, role_position, designation, joining_date, leaves_left, skills FROM employees WHERE id = ? LIMIT 1',
        [empId]
      );
      if (empRows && empRows.length > 0) {
        employeeName = empRows[0].name;
        contextParts.push(`EMPLOYEE PROFILE:\n${JSON.stringify(empRows[0])}`);
      }
    }

    // ---- Salary / Payroll ----
    if (q.includes('salary') || q.includes('pay') || q.includes('bonus') || q.includes('payroll') || q.includes('vetan')) {
      if (employeeName) {
        const [salary] = await db.promise().query(
          'SELECT * FROM payroll WHERE employee_name=? ORDER BY id DESC LIMIT 1',
          [employeeName]
        );
        contextParts.push(`SALARY DATA:\n${salary.length ? JSON.stringify(salary[0]) : 'Salary data not found for this employee.'}`);
      }
    }

    // ---- Leaves ----
    if (q.includes('leave') || q.includes('chutti') || q.includes('holiday')) {
      if (empId) {
        const [leaves] = await db.promise().query(
          'SELECT type, reason, date, status FROM leaves WHERE employee_id=? ORDER BY date DESC',
          [empId]
        );

        const approvedCount = leaves.filter(l => l.status && l.status.toLowerCase().startsWith('approv')).length;
        const rejectedCount = leaves.filter(l => l.status && l.status.toLowerCase().startsWith('reject')).length;
        const pendingCount = leaves.filter(l => l.status && l.status.toLowerCase() === 'pending').length;
        const totalApplied = leaves.length;

        const [empLeaveInfo] = await db.promise().query(
          'SELECT leaves_left FROM employees WHERE id=? LIMIT 1',
          [empId]
        );
        const leavesLeft = empLeaveInfo.length ? empLeaveInfo[0].leaves_left : null;

        contextParts.push(`LEAVE SUMMARY (calculated from actual DB records):
Total leave applications: ${totalApplied}
Approved leaves: ${approvedCount}
Rejected leaves: ${rejectedCount}
Pending leaves: ${pendingCount}
Leaves left / remaining balance (from employee record): ${leavesLeft === null ? 'Not set in database' : leavesLeft}

FULL LEAVE HISTORY (latest first):
${JSON.stringify(leaves)}`);
      } else if (userType === 'ADMIN' || userType === 'HR') {
        const [leaves] = await db.promise().query(
          'SELECT employee_name, type, reason, date, status FROM leaves ORDER BY date DESC LIMIT 30'
        );
        contextParts.push(`ALL LEAVE RECORDS (latest 30):\n${JSON.stringify(leaves)}`);
      }
    }

    // ---- Tasks ----
    if (q.includes('task') || q.includes('kaam') || q.includes('assignment')) {
      if (empId) {
        const [tasks] = await db.promise().query(
          'SELECT title, description, status, priority, task_date, client_name FROM tasks WHERE assignee_id=? ORDER BY id DESC LIMIT 15',
          [empId]
        );
        contextParts.push(`MY TASKS:\n${JSON.stringify(tasks)}`);
      } else if (userType === 'ADMIN' || userType === 'HR') {
        const [tasks] = await db.promise().query(
          'SELECT title, status, priority, task_date, client_name, assignee_id FROM tasks ORDER BY id DESC LIMIT 30'
        );
        contextParts.push(`ALL TASKS:\n${JSON.stringify(tasks)}`);
      }
    }

    // ---- Notices ----
    if (q.includes('notice') || q.includes('suchna')) {
      const [notices] = await db.promise().query(
        'SELECT title, content, priority, department, expiry FROM notices ORDER BY created_at DESC LIMIT 10'
      );
      contextParts.push(`NOTICES:\n${JSON.stringify(notices)}`);
    }

    // ---- Announcements ----
    if (q.includes('announcement') || q.includes('ghoshna')) {
      const [ann] = await db.promise().query(
        'SELECT title, content, priority, department, scheduleDate FROM announcements ORDER BY created_at DESC LIMIT 10'
      );
      contextParts.push(`ANNOUNCEMENTS:\n${JSON.stringify(ann)}`);
    }

    // ---- KPI / Performance ----
    if (q.includes('kpi') || q.includes('performance') || q.includes('rating') || q.includes('review')) {
      if (employeeName) {
        const [kpi] = await db.promise().query(
          'SELECT target, achieved, progress, status FROM kpis WHERE employee=? ORDER BY created_at DESC LIMIT 5',
          [employeeName]
        );
        contextParts.push(`MY KPI:\n${JSON.stringify(kpi)}`);
      }
      if (empId) {
        const [reviews] = await db.promise().query(
          'SELECT rating, comments, review_date, department FROM performance_reviews WHERE employee_id=? ORDER BY review_date DESC LIMIT 5',
          [empId]
        );
        contextParts.push(`MY PERFORMANCE REVIEWS:\n${JSON.stringify(reviews)}`);
      }
    }

    // ---- Projects ----
    if (q.includes('project')) {
      const [projects] = await db.promise().query(
        'SELECT title, description FROM projects ORDER BY id DESC LIMIT 15'
      );
      contextParts.push(`PROJECTS:\n${JSON.stringify(projects)}`);
    }

    // ---- Admin/HR: general employee list (only when no other context matched) ----
    if ((userType === 'ADMIN' || userType === 'HR') && contextParts.length === 0) {
      const [rows] = await db.promise().query(
        'SELECT id, name, email, department, position FROM employees LIMIT 50'
      );
      contextParts.push(`ALL EMPLOYEES:\n${JSON.stringify(rows)}`);
    }

    // ---- Groq API call with fallback ----
    let answer = '';
    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey && !groqKey.includes('placeholder')) {
      try {
        const groqClient = new Groq({ apiKey: groqKey });
        const context = contextParts.join('\n\n');
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: `You are an intelligent, helpful HR Assistant for AS GROUP DIGITAL PVT LTD. You MUST respond ONLY in clear, professional English. Do NOT write in Hindi or Hinglish, even if the user asks their question in Hindi/Hinglish. Use the exact database records provided below to answer precisely. Never make up data.

DATABASE RECORDS:
${context}`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.4,
        });

        answer = completion.choices[0]?.message?.content || '';
      } catch (aiErr) {
        console.warn('Groq AI Call failed, using direct database fallback format:', aiErr.message);
      }
    }

    // Fallback formatting if AI API key is missing, invalid, or errored
    if (!answer) {
      if (contextParts.length > 0) {
        let formattedOutputs = [];

        contextParts.forEach(part => {
          if (part.startsWith('EMPLOYEE PROFILE:')) {
            const jsonStr = part.replace('EMPLOYEE PROFILE:', '').trim();
            try {
              const data = JSON.parse(jsonStr);
              formattedOutputs.push(`👤 **Aapki Profile Details:**\n• Naam: ${data.name || '-'}\n• Email: ${data.email || '-'}\n• Department: ${data.department || '-'}\n• Designation: ${data.designation || data.position || '-'}\n• Remaining Leaves: ${data.leaves_left ?? 0} days`);
            } catch (e) {
              formattedOutputs.push(`👤 **Profile:** ${jsonStr}`);
            }
          } else if (part.startsWith('LEAVE SUMMARY')) {
            formattedOutputs.push(`📋 **Leave Summary:**\n${part.replace(/LEAVE SUMMARY \(calculated from actual DB records\):/g, '').trim()}`);
          } else if (part.startsWith('MY TASKS:')) {
            const jsonStr = part.replace('MY TASKS:', '').trim();
            try {
              const tasks = JSON.parse(jsonStr);
              if (Array.isArray(tasks) && tasks.length > 0) {
                const list = tasks.map((t, idx) => `${idx + 1}. **${t.title}** - Status: ${t.status || 'Pending'} (Priority: ${t.priority || 'Medium'})`).join('\n');
                formattedOutputs.push(`📌 **Aapke Assigned Tasks:**\n${list}`);
              } else {
                formattedOutputs.push(`📌 **Tasks:** Filhaal aapke paas koi pending task nahi hai.`);
              }
            } catch (e) {
              formattedOutputs.push(`📌 **Tasks:** ${jsonStr}`);
            }
          } else if (part.startsWith('SALARY DATA:')) {
            const jsonStr = part.replace('SALARY DATA:', '').trim();
            try {
              const s = JSON.parse(jsonStr);
              formattedOutputs.push(`💰 **Aapki Salary Details:**\n• Basic Salary: ₹${s.basic_salary || 0}\n• HRA: ₹${s.house_rent || 0}\n• Gross Salary: ₹${s.gross_salary || 0}\n• Net Salary: ₹${s.net_salary || 0}`);
            } catch (e) {
              formattedOutputs.push(`💰 **Salary:** ${jsonStr}`);
            }
          } else if (part.startsWith('NOTICES:')) {
            const jsonStr = part.replace('NOTICES:', '').trim();
            try {
              const notices = JSON.parse(jsonStr);
              if (Array.isArray(notices) && notices.length > 0) {
                const list = notices.map((n, i) => `${i + 1}. **${n.title}**: ${n.content}`).join('\n');
                formattedOutputs.push(`📢 **Company Notices:**\n${list}`);
              } else {
                formattedOutputs.push(`📢 **Notices:** Koi naya notice nahi hai.`);
              }
            } catch (e) {
              formattedOutputs.push(`📢 **Notices:** ${jsonStr}`);
            }
          } else if (part.startsWith('ANNOUNCEMENTS:')) {
            const jsonStr = part.replace('ANNOUNCEMENTS:', '').trim();
            try {
              const ann = JSON.parse(jsonStr);
              if (Array.isArray(ann) && ann.length > 0) {
                const list = ann.map((a, i) => `${i + 1}. **${a.title}**: ${a.content}`).join('\n');
                formattedOutputs.push(`📣 **Company Announcements:**\n${list}`);
              } else {
                formattedOutputs.push(`📣 **Announcements:** Koi naya announcement nahi hai.`);
              }
            } catch (e) {
              formattedOutputs.push(`📣 **Announcements:** ${jsonStr}`);
            }
          } else if (part.startsWith('MY KPI:')) {
            const jsonStr = part.replace('MY KPI:', '').trim();
            try {
              const kpis = JSON.parse(jsonStr);
              if (Array.isArray(kpis) && kpis.length > 0) {
                const list = kpis.map((k, i) => `${i + 1}. Target: ${k.target} | Achieved: ${k.achieved} | Progress: ${k.progress}%`).join('\n');
                formattedOutputs.push(`🎯 **KPI Performance:**\n${list}`);
              } else {
                formattedOutputs.push(`🎯 **KPI:** KPI data nahi mila.`);
              }
            } catch (e) {
              formattedOutputs.push(`🎯 **KPI:** ${jsonStr}`);
            }
          } else {
            formattedOutputs.push(part);
          }
        });

        answer = formattedOutputs.join('\n\n');
      } else {
        answer = 'Aapka sawaal prapt hua, par isse related koi record database me nahi mila. Kripya HR department se sampark karein.';
      }
    }

    return res.json({
      question: text,
      answer
    });
  } catch (error) {
    console.error('HR Assistant Error:', error);
    return res.status(500).json({ error: error.message || 'AI backend error' });
  }
};