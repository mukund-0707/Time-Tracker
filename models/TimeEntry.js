const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  user: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
