const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, default: 'todo' }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
