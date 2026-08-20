const db = require('../configer/db');

// FIX: list & get now LEFT JOIN employees so the assigned employee's name
// comes back as `assign_to` (and dept) — before this, only the raw
// assignee_id (a number) was returned, so the frontend always showed
// "Not Assigned" even though the task WAS correctly linked in the DB.
exports.list = (req, res) => {
	const sql = `
	SELECT t.*, 
	       COALESCE(e.name, t.assign_to) AS assign_to, 
	       COALESCE(t.dept, e.department) AS dept,
	       g.name AS group_name,
	       GROUP_CONCAT(DISTINCT eg.name) AS group_members
	FROM tasks t
	LEFT JOIN employees e ON t.assignee_id = e.id
	LEFT JOIN \`groups\` g ON t.group_id = g.id
	LEFT JOIN group_members gm ON g.id = gm.group_id
	LEFT JOIN employees eg ON gm.employee_id = eg.id
	GROUP BY t.id
	ORDER BY t.created_at DESC
`;
	db.query(sql, (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json(result);
	});
};

// Get tasks for a specific employee (including group tasks)
exports.listByEmployee = (req, res) => {
	const { empId } = req.params;
	const sql = `
	SELECT t.*, 
	       COALESCE(e.name, t.assign_to) AS assign_to, 
	       COALESCE(t.dept, e.department) AS dept,
	       g.name AS group_name,
	       GROUP_CONCAT(DISTINCT eg.name) AS group_members
	FROM tasks t
	LEFT JOIN employees e ON t.assignee_id = e.id
	LEFT JOIN \`groups\` g ON t.group_id = g.id
	LEFT JOIN group_members gm ON g.id = gm.group_id
	LEFT JOIN employees eg ON gm.employee_id = eg.id
	WHERE t.assignee_id = ?
	   OR t.group_id IN (SELECT group_id FROM group_members WHERE employee_id = ?)
	GROUP BY t.id
	ORDER BY t.created_at DESC
`;
	db.query(sql, [empId, empId], (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json(result);
	});
};

exports.get = (req, res) => {
	const { id } = req.params;
	const sql = `
		SELECT t.*, 
		       COALESCE(e.name, t.assign_to) AS assign_to, 
		       COALESCE(t.dept, e.department) AS dept,
		       g.name AS group_name,
		       GROUP_CONCAT(DISTINCT eg.name) AS group_members
		FROM tasks t
		LEFT JOIN employees e ON t.assignee_id = e.id
		LEFT JOIN \`groups\` g ON t.group_id = g.id
		LEFT JOIN group_members gm ON g.id = gm.group_id
		LEFT JOIN employees eg ON gm.employee_id = eg.id
		WHERE t.id = ?
		GROUP BY t.id
		`;
	db.query(sql, [id], (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json(result[0] || null);
	});
};

// Create task: accepts either assignee_id or assignee_name, and project_id or project_name (client/project)
// Also accepts an array of tasks in the request body and will insert them all.
const queryAsync = (sql, params=[]) => new Promise((resolve, reject) => {
	db.query(sql, params, (err, res) => err ? reject(err) : resolve(res));
});

const findOrCreateProjectAsync = async (project_id, project_name) => {
	if (project_id) return project_id;
	if (!project_name) return null;
	const rows = await queryAsync('SELECT id FROM projects WHERE title = ?', [project_name]);
	if (rows && rows.length) return rows[0].id;
	const ins = await queryAsync('INSERT INTO projects (title, description) VALUES (?, ?)', [project_name, '']);
	return ins.insertId;
};

const findOrCreateAssigneeAsync = async (assignee_id, assignee_name) => {
	if (assignee_name) {
		const rows = await queryAsync('SELECT id FROM employees WHERE name = ?', [assignee_name]);
		if (rows && rows.length) return rows[0].id;
	}
	if (assignee_id) return assignee_id;
	if (!assignee_name) return null;
	const ins = await queryAsync('INSERT INTO employees (name, password, department, position) VALUES (?, ?, ?, ?)', [assignee_name, '', '', '']);
	return ins.insertId;
};

// Create or find a group by name, then set its members
const findOrCreateGroupAsync = async (group_name, member_ids) => {
	if (!group_name && (!member_ids || !member_ids.length)) return null;
	const name = group_name || member_ids.join(',');

	// Try to find existing group with this name
	const existing = await queryAsync('SELECT id FROM `groups` WHERE name = ?', [name]);
	let groupId;
	if (existing && existing.length) {
		groupId = existing[0].id;
	} else {
		const ins = await queryAsync('INSERT INTO `groups` (name) VALUES (?)', [name]);
		groupId = ins.insertId;
	}

	// Clear old members and insert new ones
	if (member_ids && member_ids.length) {
		await queryAsync('DELETE FROM group_members WHERE group_id = ?', [groupId]);
		for (const empId of member_ids) {
			await queryAsync('INSERT IGNORE INTO group_members (group_id, employee_id) VALUES (?, ?)', [groupId, empId]);
		}
	}
	return groupId;
};

const insertSingleTaskAsync = async (task) => {
	// normalize alternate frontend field names to backend expected ones
	const title = task.title;
	const description = task.description || task.remarks || '';
	const project_id = task.project_id || null;
	const project_name = task.project_name || task.client_name || task.client || null;
	const assignee_id = task.assignee_id || null;
	const assignee_name = task.assignee_name || task.assign_to || task.empName || null;
	const status = task.status || 'Pending';
	const task_date = task.task_date || task.start_date || task.date || null;
	const start_date = task.start_date || task_date || null;
	const due_date = task.due_date || null;
	const task_type = task.task_type || 'Self Task';
	const hours = (typeof task.hours !== 'undefined') ? task.hours : (task.hrs || 0);
	const minutes = (typeof task.minutes !== 'undefined') ? task.minutes : (task.mins || task.mins === 0 ? task.mins : 0);
	const priority = task.priority || 'Normal';
	const client_name = task.client_name || task.client || null;
	const progress_percentage = (typeof task.progress_percentage !== 'undefined') ? parseInt(task.progress_percentage) : (status === 'Completed' ? 100 : 0);

	const projId = await findOrCreateProjectAsync(project_id, project_name);
	const assId = await findOrCreateAssigneeAsync(assignee_id, assignee_name);

	// Handle group assignment
	let groupId = task.group_id || null;
	if (task.group_member_ids && task.group_member_ids.length) {
		groupId = await findOrCreateGroupAsync(task.group_name || null, task.group_member_ids);
	}

	const sql = `INSERT INTO tasks (title, description, project_id, assignee_id, group_id, status, task_date, start_date, due_date, task_type, hours, minutes, priority, client_name, progress_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
	const res = await queryAsync(sql, [
		title,
		description || '',
		projId,
		assId,
		groupId,
		status || 'Pending',
		task_date || null,
		start_date || null,
		due_date || null,
		task_type || 'Self Task',
		parseInt(hours) || 0,
		parseInt(minutes) || 0,
		priority || 'Normal',
		client_name || project_name || null,
		progress_percentage
	]).catch(async (err) => {
		const fallbackSql = `INSERT INTO tasks (title, description, project_id, assignee_id, group_id, status, task_date, start_date, due_date, task_type, hours, minutes, priority, client_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		return await queryAsync(fallbackSql, [
			title,
			description || '',
			projId,
			assId,
			groupId,
			status || 'Pending',
			task_date || null,
			start_date || null,
			due_date || null,
			task_type || 'Self Task',
			parseInt(hours) || 0,
			parseInt(minutes) || 0,
			priority || 'Normal',
			client_name || project_name || null
		]).catch(async () => {
			const fallbackSql2 = `INSERT INTO tasks (title, description, project_id, assignee_id, group_id, status, task_date, hours, minutes, priority, client_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
			return await queryAsync(fallbackSql2, [
				title,
				description || '',
				projId,
				assId,
				groupId,
				status || 'Pending',
				task_date || null,
				parseInt(hours) || 0,
				parseInt(minutes) || 0,
				priority || 'Normal',
				client_name || project_name || null
			]);
		});
	});

	// Send notification to each group member via chat_messages
	if (groupId) {
		try {
			const members = await queryAsync('SELECT gm.employee_id, e.name FROM group_members gm JOIN employees e ON gm.employee_id = e.id WHERE gm.group_id = ?', [groupId]);
			const memberNames = members.map(m => m.name).join(', ');
			for (const member of members) {
				const notifMsg = `📋 New Group Task Assigned: "${title}" (TSK-${res.insertId})\n👥 Group Members: ${memberNames}\nAssigned by Admin.`;
				await queryAsync(
					`INSERT INTO chat_messages (room, sender_id, sender_name, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
					[`chat_${member.employee_id}_admin`, 'admin', 'System Notification', 'admin', notifMsg]
				).catch(() => {});
			}
		} catch(e) { console.error('Group notification error:', e); }
	}

	return res.insertId;
};

exports.create = async (req, res) => {
	try {
		const payload = req.body;
		if (Array.isArray(payload)) {
			if (!payload.length) return res.status(400).json({ success: false, message: 'Empty tasks array' });
			const ids = [];
			for (const t of payload) {
				const id = await insertSingleTaskAsync(t);
				ids.push(id);
			}
			return res.status(201).json({ success: true, ids });
		} else {
			const id = await insertSingleTaskAsync(payload);
			return res.status(201).json({ success: true, id });
		}
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// Auto ensure DB columns exist on load
db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT NULL", () => {});
db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL", () => {});
db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'Self Task'", () => {});
db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress_percentage INT DEFAULT 0", () => {});
db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dept VARCHAR(255) DEFAULT NULL", () => {});
db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS group_id INT DEFAULT NULL", () => {});
db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assign_to VARCHAR(255) DEFAULT NULL", () => {});

// Auto-create groups and group_members tables
db.query(`CREATE TABLE IF NOT EXISTS \`groups\` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, () => {});
db.query(`CREATE TABLE IF NOT EXISTS group_members (
  group_id INT NOT NULL,
  employee_id INT NOT NULL,
  PRIMARY KEY (group_id, employee_id)
)`, () => {});

exports.update = async (req, res) => {
	try {
		const { id } = req.params;
		const task = req.body;

		// Fetch previous task state to check if assignee changed
		const existingRows = await queryAsync('SELECT * FROM tasks WHERE id = ?', [id]);
		const previousTask = (existingRows && existingRows.length) ? existingRows[0] : null;

		const title = task.title;
		const description = task.description || task.remarks || '';
		const project_id = task.project_id || null;
		const project_name = task.project_name || task.client_name || task.client || null;
		const assignee_id = task.assignee_id || null;
		const assignee_name = task.assignee_name || task.assign_to || task.empName || null;
		const status = task.status || 'Pending';
		const task_date = task.task_date || task.start_date || task.date || null;
		const start_date = task.start_date || task_date || null;
		const due_date = task.due_date || null;
		const task_type = task.task_type || 'Self Task';
		const hours = (typeof task.hours !== 'undefined') ? task.hours : (task.hrs || 0);
		const minutes = (typeof task.minutes !== 'undefined') ? task.minutes : (task.mins || task.mins === 0 ? task.mins : 0);
		const priority = task.priority || 'Normal';
		const client_name = task.client_name || task.client || null;
		const dept = task.dept || null;
		let progress_percentage = (typeof task.progress_percentage !== 'undefined') ? parseInt(task.progress_percentage) : (status === 'Completed' ? 100 : 0);
		if (status === 'Completed') progress_percentage = 100;

		// Handle group assignment on update too
		let group_id = task.group_id || null;
		if (task.group_member_ids && task.group_member_ids.length) {
			group_id = await findOrCreateGroupAsync(task.group_name || null, task.group_member_ids);
		}

		const projId = await findOrCreateProjectAsync(project_id, project_name);
		const assId = await findOrCreateAssigneeAsync(assignee_id, assignee_name);

		const sql = 'UPDATE tasks SET title=?, description=?, project_id=?, assignee_id=?, assign_to=?, group_id=?, status=?, task_date=?, start_date=?, due_date=?, task_type=?, hours=?, minutes=?, priority=?, client_name=?, progress_percentage=?, dept=? WHERE id=?';
		
		try {
			await queryAsync(sql, [title, description, projId, assId, assignee_name, group_id, status, task_date, start_date, due_date, task_type, parseInt(hours) || 0, parseInt(minutes) || 0, priority, client_name, progress_percentage, dept, id]);
		} catch (err) {
			console.log('Update error:', err);
			const fallbackSql = 'UPDATE tasks SET title=?, description=?, project_id=?, assignee_id=?, assign_to=?, group_id=?, status=?, task_date=?, start_date=?, due_date=?, task_type=?, priority=?, client_name=? WHERE id=?';
			await queryAsync(fallbackSql, [title, description, projId, assId, assignee_name, group_id, status, task_date, start_date, due_date, task_type, priority, client_name, id]);
		}

		// Re-assignment Notification Check
		if (previousTask && previousTask.assignee_id && assId && String(previousTask.assignee_id) !== String(assId)) {
			try {
				const notifMsg = `📢 Task Reassignment Notice: Your task "${title}" (TSK-${id}) has been re-assigned to ${assignee_name} by Admin.`;
				await queryAsync(
					`INSERT INTO chat_messages (room, sender_id, sender_name, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
					[`chat_${previousTask.assignee_id}_admin`, 'admin', 'System Notification', 'admin', notifMsg]
				).catch(() => {});
			} catch (e) {
				console.error("Notification insert error:", e);
			}
		}

		return res.json({ success: true });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.remove = (req, res) => {
	const { id } = req.params;
	db.query('DELETE FROM tasks WHERE id=?', [id], (err) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json({ success: true });
	});
};

// ========== GROUP MANAGEMENT APIS ==========

// List all groups with their members
exports.listGroups = async (req, res) => {
	try {
		const groups = await queryAsync('SELECT * FROM `groups` ORDER BY created_at DESC');
		for (const g of groups) {
			const members = await queryAsync(
				'SELECT e.id, e.name, e.department FROM group_members gm JOIN employees e ON gm.employee_id = e.id WHERE gm.group_id = ?',
				[g.id]
			);
			g.members = members;
		}
		res.json(groups);
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Create a new group
exports.createGroup = async (req, res) => {
	try {
		const { name, member_ids } = req.body;
		if (!name) return res.status(400).json({ success: false, message: 'Group name required' });
		const groupId = await findOrCreateGroupAsync(name, member_ids || []);
		res.status(201).json({ success: true, id: groupId });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Delete a group
exports.deleteGroup = (req, res) => {
	const { id } = req.params;
	db.query('DELETE FROM `groups` WHERE id = ?', [id], (err) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json({ success: true });
	});
};