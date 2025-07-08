const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Estado del usuario
    resetPasswordToken: String,
    resetPasswordExpires: Date

});

module.exports = mongoose.model('User', UserSchema);
