const db = require('../configer/db');
const jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');

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
    const { identifier, name, password } = req.body || {};
    const loginIdentifier = (identifier || name || '').trim();
    if (!loginIdentifier || !password) {
        return res.status(400).json({ success: false, message: 'Login ID and password required' });
    }

    // Admins sign in with their username and password.
    const adminSql = 'SELECT id, name, password FROM admin WHERE LOWER(name) = LOWER(?)';
    db.query(adminSql, [loginIdentifier], (err, adminResult) => {
        if (err) {
            console.error('Login error (admin query):', err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (adminResult && adminResult.length > 0) {
            const admin = adminResult[0];
            const isAdminPasswordMatch = admin.password ? (bcrypt.compareSync(password, admin.password) || admin.password === password) : false;
            if (!isAdminPasswordMatch) {
                return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
            }
            const token = jwt.sign({ id: admin.id, name: admin.name, role: 'admin' });
            console.log('Login success: admin', admin.name);
            return res.json({ 
                success: true, 
                message: 'Login successful', 
                user: { id: admin.id, name: admin.name, role: 'admin' },
                token: token 
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid employee email address. Admins can sign in with their username.'
            });
        }

        // Employees sign in with registered email and password (bcrypt or legacy match)
        const employeeEmail = loginIdentifier.toLowerCase();
        const empSql = 'SELECT id, name, email, password, role FROM employees WHERE LOWER(email) = ?';
        db.query(empSql, [employeeEmail], (err2, empResult) => {
            if (err2) {
                console.error('Login error (employee query):', err2.message);
                return res.status(500).json({ success: false, message: err2.message });
            }
            if (empResult && empResult.length > 0) {
                const emp = empResult[0];
                let isPasswordMatch = false;

                if (emp.password) {
                    try {
                        isPasswordMatch = bcrypt.compareSync(password, emp.password);
                    } catch {
                        isPasswordMatch = false;
                    }
                    if (!isPasswordMatch && emp.password === password) {
                        isPasswordMatch = true; // Fallback for legacy unhashed passwords
                    }
                }

                if (!isPasswordMatch) {
                    return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
                }

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

            console.log('Login failed for:', loginIdentifier);
            return res.status(404).json({
                success: false,
                message: 'User does not exist. Please check your email address or contact your administrator.'
            });
        });
    });
};

// Development helper: list users
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
