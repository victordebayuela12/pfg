const mongoose = require('mongoose');

const DiseaseVersionSchema = new mongoose.Schema({
    disease: { type: mongoose.Schema.Types.ObjectId, ref: 'Disease', required: true },
    resume: { type: String, required: true },
    descriptions: [
        {
            descripcion: { type: String, required: true },
            image: { type: String },
            _id: false
        },
    ],
    doctorCreador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Treatment" }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionComment: { type: String, default:"" } 
}, { timestamps: true });

module.exports = mongoose.model('DiseaseVersion', DiseaseVersionSchema);
