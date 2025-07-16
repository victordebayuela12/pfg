const mongoose = require('mongoose');

const DiseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true 
  },
  version_aprobada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiseaseVersion',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Disease', DiseaseSchema);
