const db = require('../configer/db');

exports.dashboard = (req, res) => {
	const data = {};
	db.query('SELECT COUNT(*) as count FROM employees', (err, empRes) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		data.employees = empRes[0].count || 0;
		db.query('SELECT COUNT(*) as count FROM projects', (err2, projRes) => {
			if (err2) return res.status(500).json({ success: false, message: err2.message });
			data.projects = projRes[0].count || 0;
			db.query('SELECT COUNT(*) as count FROM tasks', (err3, taskRes) => {
				if (err3) return res.status(500).json({ success: false, message: err3.message });
				data.tasks = taskRes[0].count || 0;
				res.json({ success: true, data });
			});
		});
	});
};
