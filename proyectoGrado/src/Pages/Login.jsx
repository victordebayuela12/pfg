import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../Services/authService";
import { Link } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
/*
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Llamar al backend para validar credenciales
            const response = await loginUser({ email, password });

            if (!response.token || !response.userId || !response.role) {
                throw new Error("No se recibió el token, ID de usuario o rol.");
            }

            // Guardar datos en localStorage
            localStorage.setItem("jwtToken", response.token);
            localStorage.setItem("userId", response.userId);
            localStorage.setItem("role", response.role);
            localStorage.setItem("email", email);

            console.log("🟢 Token guardado:", response.token);
            console.log("🟢 ID del usuario guardado:", response.userId);
            console.log("🟢 Rol del usuario:", response.role);

            // Redirigir según el rol
            switch (response.role) {
                case "admin":
                    navigate("/admin");
                    break;
                case "doctor":
                    navigate("/createPatient");
                    break;
                case "patient":
            navigate("/game");
            break;
                default:
                    setError("Rol desconocido. Inténtalo nuevamente.");
                    break;
            }
        } catch (err) {
            console.error("🔴 Error en el inicio de sesión:", err);
            setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
        }
    }; */
    const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 👉 Acceso local offline sin servidor
    if (email === "medico@gmail.com" && password === "medico") {
        const fakeToken = "offline-token";
        const fakeUserId = "offline-user-id";
        const fakeRole = "doctor";

        localStorage.setItem("jwtToken", fakeToken);
        localStorage.setItem("userId", fakeUserId);
        localStorage.setItem("role", fakeRole);
        localStorage.setItem("email", email);

        console.log("🟢 Acceso local offline concedido");
        navigate("/createPatient");
        return;
    }

    // 🧪 Login normal con backend
    try {
        const response = await loginUser({ email, password });

        if (!response.token || !response.userId || !response.role) {
            throw new Error("No se recibió el token, ID de usuario o rol.");
        }

        localStorage.setItem("jwtToken", response.token);
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("role", response.role);
        localStorage.setItem("email", email);

        switch (response.role) {
            case "admin":
                navigate("/admin");
                break;
            case "doctor":
                navigate("/createPatient");
                break;
            case "patient":
                navigate("/game");
                break;
            default:
                setError("Rol desconocido. Inténtalo nuevamente.");
                break;
        }
    } catch (err) {
        console.error("🔴 Error en el inicio de sesión:", err);
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    }
};


    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Iniciar Sesión</h1>
                <p className="login-description">
                    Accede a tu cuenta para comenzar
                </p>
                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        required
                    />
                    <button type="submit" className="form-button">
                        Iniciar Sesión
                    </button>
                     <Link to="/forgot-password">¿Se te ha olvidado tu contraseña?</Link>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p className="form-footer">
                    ¿No tienes una cuenta? <a href="/register">Regístrate</a>
                </p>
            </div>
        </div>
    );
}

export default Login;
