const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'employee' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
