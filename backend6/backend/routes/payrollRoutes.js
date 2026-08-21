const express = require('express');
const router = express.Router();
const db = require('../configer/db'); // Aapka database connection

// 1. Save Payroll
router.post('/save', (req, res) => {
    // PF, ESI, aur TAX yahan add kiya hai
    const { employee, basicSalary, houseRent, medical, travel, overtime, bonus, leaveDeduction, otherDeduction, gross, net, pf, esi, tax, month_year, absent_days, half_days, late_fines } = req.body;
    
    // SQL query mein column names aur placeholders (?) badhaye hain
    const sql = "INSERT INTO payroll (employee_name, basic_salary, house_rent, medical, travel, overtime, bonus, leave_deduction, other_deduction, gross_salary, net_salary, pf, esi, tax, month_year, absent_days, half_days, late_fines) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    
    db.query(sql, [employee, basicSalary, houseRent, medical, travel, overtime, bonus, leaveDeduction, otherDeduction, gross, net, pf, esi, tax, month_year || null, absent_days || 0, half_days || 0, late_fines || 0], (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json({ message: "Payroll Saved!" });
    });
});

// 2. Get All Payroll Records
router.get('/all', (req, res) => {
    db.query("SELECT * FROM payroll", (err, results) => {
        if(err) return res.status(500).json(err);
        return res.json(results);
    });
});

// 3. Delete Payroll
router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM payroll WHERE id = ?", [id], (err, result) => {
        if(err) return res.status(500).json(err);
        return res.json({ message: "Payroll Deleted!" });
    });
});

module.exports = router;