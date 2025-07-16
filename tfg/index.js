const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes.js'); // Rutas de usuarios
const treatmentRoutes= require('./routes/treatmentRoutes.js');
const diseaseVersionRoutes= require('./routes/diseaseVersionRoutes.js');
const diseaseRoutes= require('./routes/diseaseRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
  credentials: true, 
}));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000, 
})
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch((err) => console.error('Error conectando a MongoDB:', err));


app.use('/api/diseases', diseaseRoutes);
app.use('/api/diseaseVersions', diseaseVersionRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/users',userRoutes);
app.use('/auth', authRoutes);
app.use('/api/patients', patientRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
