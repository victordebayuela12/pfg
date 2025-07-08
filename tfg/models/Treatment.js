const mongoose = require('mongoose');

const TreatmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    descriptions: [
        {
            descripcion: { type: String, required: true },
            image: { type: String },
            _id: false
        },
    ],
    benefits: { type: String, required: true },
    risks: { type: String, required: true },
    doctorCreador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 👈 Nuevo campo
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionComment: { type: String, default:"" } // nuevo campo opcional
}, { timestamps: true });

module.exports = mongoose.model('Treatment', TreatmentSchema);
