const db = require('../configer/db');

exports.list = (req, res) => {
	db.query('SELECT * FROM projects', (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json(result);
	});
};

exports.get = (req, res) => {
	const { id } = req.params;
	db.query('SELECT * FROM projects WHERE id = ?', [id], (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json(result[0] || null);
	});
};

exports.create = (req, res) => {
	const { title, description } = req.body;
	db.query('INSERT INTO projects (title, description) VALUES (?, ?)', [title, description], (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.status(201).json({ success: true, id: result.insertId });
	});
};

exports.update = (req, res) => {
	const { id } = req.params;
	const { title, description } = req.body;
	db.query('UPDATE projects SET title=?, description=? WHERE id=?', [title, description, id], (err) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json({ success: true });
	});
};

exports.remove = (req, res) => {
	const { id } = req.params;
	db.query('DELETE FROM projects WHERE id=?', [id], (err) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json({ success: true });
	});
};
