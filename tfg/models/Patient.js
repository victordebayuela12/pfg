const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    disease: { type: mongoose.Schema.Types.ObjectId, ref: 'Disease', required: true },
    treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Treatment', required: true }],
    resetPasswordToken: String,
    resetPasswordExpires: Date

  });
  

module.exports = mongoose.model('Patient', patientSchema);
