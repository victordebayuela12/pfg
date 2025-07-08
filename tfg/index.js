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

 // Rutas de enfermedades

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Aquí pon la URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Los métodos que permitan
  credentials: true, // Si necesitas permitir credenciales como cookies
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000, // 30 segundos
})
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch((err) => console.error('Error conectando a MongoDB:', err));

// Usar las rutas
app.use('/api/diseases', diseaseRoutes);
app.use('/api/diseaseVersions', diseaseVersionRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/users',userRoutes);
app.use('/auth', authRoutes);
app.use('/api/patients', patientRoutes);
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
