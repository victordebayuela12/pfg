const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({ error: "Token no proporcionado" });
    }
    console.log("🔐 Token recibido:", authHeader);

    const token = authHeader.split(' ')[1]; // Extraer el token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Token inválido o expirado" });
        }
        console.log("✅ Decoded token:", decoded);

        req.user_id = decoded.id; // Guardamos el ID del usuario autenticado
        req.user_role = decoded.role; // Opcional: Si necesitas el rol también
        req.user_email = decoded.email;
        next();
    });
};

module.exports = authenticateJWT;
