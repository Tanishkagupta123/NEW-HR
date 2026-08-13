const db = require('../configer/db');

// Get All Employees
exports.list = (req, res) => {
	const sql = `
		SELECT
			id, skills, name, email, phone_number,
			department, position, monthly_salary, role_position,
			joining_date, employee_code, profile_pic, aadhaar_file,
			pan_file, certificate_file, created_at, updated_at,
			designation, role, leaves_left
		FROM employees
	`;
	db.query(sql, (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json(result);
	});
};

// Get Single Employee
exports.get = (req, res) => {
	const { id } = req.params;
	db.query('SELECT * FROM employees WHERE id = ?', [id], (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json(result[0] || null);
	});
};

// Create Employee
exports.create = (req, res) => {
	const {
		name, email,
		phone_number: phoneNumberFromBody,
		phone, department, position,
		monthly_salary, role_position,
		joining_date, password,
		designation, role, leaves_left, skills
	} = req.body;

	const phoneNumber = phoneNumberFromBody || phone;

	// Validation
	if (!name)           return res.status(400).json({ success: false, message: 'Full Name is required' });
	if (!email)          return res.status(400).json({ success: false, message: 'Email Address is required' });
	if (!/^[^\s@]+@gmail\.com$/.test(email))
		return res.status(400).json({ success: false, message: 'Email must be a valid @gmail.com address' });
	if (!phoneNumber)    return res.status(400).json({ success: false, message: 'Phone Number is required' });
	if (!/^\d{10}$/.test(phoneNumber.replace(/^\+91/, '')))
		return res.status(400).json({ success: false, message: 'Phone number must be 10 digits only' });
	if (!password)       return res.status(400).json({ success: false, message: 'Password is required' });
	if (!/^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password))
		return res.status(400).json({ success: false, message: 'Password must be at least 8 chars and include a number + symbol' });
	if (!joining_date)   return res.status(400).json({ success: false, message: 'Joining Date is required' });
	if (!department)     return res.status(400).json({ success: false, message: 'Department is required' });
	if (!designation)    return res.status(400).json({ success: false, message: 'Designation is required' });
	if (!monthly_salary) return res.status(400).json({ success: false, message: 'Monthly Salary is required' });
	if (!role)           return res.status(400).json({ success: false, message: 'Role is required' });
	if (!role_position)  return res.status(400).json({ success: false, message: 'Role Position is required' });

	// Files
	const profilePicPath  = req.files?.profile_pic?.[0]
		? '/uploads/profiles/' + req.files.profile_pic[0].filename : null;
	const aadhaarPath     = req.files?.aadhaar_file?.[0]
		? '/uploads/profiles/' + req.files.aadhaar_file[0].filename : null;
	const panPath         = req.files?.pan_file?.[0]
		? '/uploads/profiles/' + req.files.pan_file[0].filename : null;
	const certificatePath = req.files?.certificate_file?.[0]
		? '/uploads/profiles/' + req.files.certificate_file[0].filename : null;

	// Serial employee code — DB se last id lo
	db.query('SELECT MAX(id) as maxId FROM employees', (err, result) => {
		if (err) return res.status(500).json({ success: false, message: err.message });

		const nextNum = (result?.[0]?.maxId || 0) + 1;
		const empCode = 'EMP-' + nextNum;

		const sql = `
			INSERT INTO employees (
				name, email, phone_number, password,
				department, position, role_position, joining_date,
				employee_code, profile_pic, aadhaar_file,
				pan_file, certificate_file, designation,
				leaves_left, skills, monthly_salary, role
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;

		db.query(sql, [
			name, email, phoneNumber, password,
			department, position || 'Employee',
			role_position, joining_date,
			empCode, profilePicPath, aadhaarPath,
			panPath, certificatePath, designation,
			leaves_left || 0,
			skills ? JSON.stringify(skills) : null,
			monthly_salary, role || 'employee'
		], (err, result) => {
			if (err) {
				console.error('DB Error:', err);
				if (err.code === 'ER_DUP_ENTRY') {
					return res.status(400).json({
						success: false,
						message: 'This email is already registered! Please use a different email.'
					});
				}
				return res.status(500).json({ success: false, message: err.message });
			}
			res.status(201).json({
				success: true,
				message: 'Employee added successfully!',
				id: result.insertId,
				employee_code: empCode
			});
		});
	});
};

// Update Employee
exports.update = (req, res) => {
	const { id } = req.params;
	const {
		name, email,
		phone_number: phoneNumberFromBody,
		phone, department, position,
		monthly_salary, role_position,
		joining_date, password,
		employee_code, designation,
		role, leaves_left, skills
	} = req.body;

	const phoneNumber = phoneNumberFromBody || phone;

	const profilePicPath  = req.files?.profile_pic?.[0]
		? '/uploads/profiles/' + req.files.profile_pic[0].filename : null;
	const aadhaarPath     = req.files?.aadhaar_file?.[0]
		? '/uploads/profiles/' + req.files.aadhaar_file[0].filename : null;
	const panPath         = req.files?.pan_file?.[0]
		? '/uploads/profiles/' + req.files.pan_file[0].filename : null;
	const certificatePath = req.files?.certificate_file?.[0]
		? '/uploads/profiles/' + req.files.certificate_file[0].filename : null;

	const sql = `
		UPDATE employees SET
			name = ?, email = ?, phone_number = ?,
			department = ?, position = ?, monthly_salary = ?,
			role_position = ?, joining_date = ?, password = ?,
			employee_code = ?,
			profile_pic = COALESCE(?, profile_pic),
			aadhaar_file = COALESCE(?, aadhaar_file),
			pan_file = COALESCE(?, pan_file),
			certificate_file = COALESCE(?, certificate_file),
			designation = ?, role = ?, leaves_left = ?, skills = ?
		WHERE id = ?
	`;

	db.query(sql, [
		name, email, phoneNumber,
		department || null, position || 'Employee',
		monthly_salary || 0, role_position || null,
		joining_date || null, password || null,
		employee_code || null,
		profilePicPath, aadhaarPath, panPath, certificatePath,
		designation || null, role || 'employee',
		leaves_left || 0,
		skills ? JSON.stringify(skills) : null,
		id
	], (err) => {
		if (err) {
			console.error('DB Error:', err);
			if (err.code === 'ER_DUP_ENTRY') {
				return res.status(400).json({ success: false, message: 'This email is already registered!' });
			}
			return res.status(500).json({ success: false, message: err.message });
		}
		res.json({ success: true, message: 'Employee updated successfully' });
	});
};

// Delete Employee
exports.remove = (req, res) => {
	const { id } = req.params;
	db.query('DELETE FROM employees WHERE id = ?', [id], (err) => {
		if (err) return res.status(500).json({ success: false, message: err.message });
		res.json({ success: true, message: 'Employee deleted successfully' });
	});
};

// Update Skills
exports.updateSkills = (req, res) => {
	const { id } = req.params;
	const { skill } = req.body;

	if (!skill || typeof skill !== 'string') {
		return res.status(400).json({ success: false, message: 'Skill string required' });
	}

	db.query('SELECT skills FROM employees WHERE id = ?', [id], (err, results) => {
		if (err) return res.status(500).json({ success: false, message: err.message });

		const row = results && results[0];
		let skills = [];
		if (row && row.skills) {
			try {
				skills = JSON.parse(row.skills);
				if (!Array.isArray(skills)) skills = [];
			} catch (e) {
				skills = (row.skills || '').split(',').map(s => s.trim()).filter(Boolean);
			}
		}
		if (!skills.includes(skill)) skills.push(skill);
		const skillsStr = JSON.stringify(skills);
		db.query('UPDATE employees SET skills = ? WHERE id = ?', [skillsStr, id], (uErr) => {
			if (uErr) return res.status(500).json({ success: false, message: uErr.message });
			res.json({ success: true, message: 'Skills updated', skills });
		});
	});
};