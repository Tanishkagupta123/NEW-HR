const db = require('../configer/db');

exports.savePayroll = (req, res) => {
  const { employee, basicSalary, houseRent, medical, travel, overtime, bonus, leaveDeduction, otherDeduction, gross, net, pf, esi, tax, email, month_year, absent_days, half_days, late_fines } = req.body;
  const sql = "INSERT INTO payroll (employee_name, basic_salary, house_rent, medical, travel, overtime, bonus, leave_deduction, other_deduction, gross_salary, net_salary, pf, esi, tax, email, month_year, absent_days, half_days, late_fines) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  db.query(sql, [employee, basicSalary, houseRent, medical, travel, overtime, bonus, leaveDeduction, otherDeduction, gross, net, pf, esi, tax, email, month_year || null, absent_days || 0, half_days || 0, late_fines || 0], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json({ message: 'Payroll Saved!' });
  });
};

exports.getAllPayroll = (req, res) => {
  db.query('SELECT * FROM payroll', (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
};
