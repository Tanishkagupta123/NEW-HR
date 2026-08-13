const db = require('../configer/db');
const jwt = require('../utils/jwt');

exports.register = (req, res) => {
    const { name, password } = req.body || {};
    if (!name || !password) return res.status(400).json({ success: false, message: 'Name and password required' });

    const sql = 'INSERT INTO admin (name, password) VALUES (?, ?)';
    db.query(sql, [name, password], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(201).json({ success: true, message: 'Admin registered', id: result.insertId });
    });
};

exports.login = (req, res) => {
    const { name, password } = req.body || {};
    if (!name || !password) return res.status(400).json({ success: false, message: 'Name and password required' });

    // normalize input
    const loginName = (name || '').trim();

    // Try admin table (case-insensitive name match)
    const adminSql = 'SELECT id, name FROM admin WHERE LOWER(name) = LOWER(?) AND password = ?';
    db.query(adminSql, [loginName, password], (err, adminResult) => {
        if (err) {
            console.error('Login error (admin query):', err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (adminResult && adminResult.length > 0) {
            const admin = adminResult[0];
            const token = jwt.sign({ id: admin.id, name: admin.name, role: 'admin' });
            console.log('Login success: admin', admin.name);
            return res.json({ 
                success: true, 
                message: 'Login successful', 
                user: { id: admin.id, name: admin.name, role: 'admin' },
                token: token 
            });
        }

        // Try employees table (case-insensitive name match)
        const empSql = 'SELECT id, name, role FROM employees WHERE LOWER(name) = LOWER(?) AND password = ?';
        db.query(empSql, [loginName, password], (err2, empResult) => {
            if (err2) {
                console.error('Login error (employee query):', err2.message);
                return res.status(500).json({ success: false, message: err2.message });
            }
            if (empResult && empResult.length > 0) {
                const emp = empResult[0];
                const userRole = emp.role || 'employee';
                const token = jwt.sign({ id: emp.id, name: emp.name, role: userRole });
                console.log('Login success:', userRole, emp.name);
                return res.json({ 
                    success: true, 
                    message: 'Login successful', 
                    user: { id: emp.id, name: emp.name, role: userRole },
                    token: token 
                });
            }

            console.log('Login failed for:', loginName);
            // Fallback: allow any user to login as employee (development convenience)
            console.log('Fallback login granted for:', loginName);
            // Updated custom error message
            return res.json({ success: false, message: 'User does not exist or incorrect details' });
        });
    });
};

// Development helper: list users (admins + employees)
exports.listTestUsers = (req, res) => {
    const adminsSql = 'SELECT id, name, password, "admin" as role FROM admin';
    const empSql = 'SELECT id, name, password, "employee" as role FROM employees';

    db.query(adminsSql, (err, adminRows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        db.query(empSql, (err2, empRows) => {
            if (err2) return res.status(500).json({ success: false, message: err2.message });
            return res.json({ success: true, users: [...adminRows, ...empRows] });
        });
    });
};