import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext.tsx";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useUser();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                const loggedUser = { username, role: data.user.role };

                login(data.access_token, loggedUser);

                navigate("/");
            } else {
                alert(data.msg || "Error al iniciar sesión");
            }
        } catch (error) {
            console.error("Error de conexión con backend:", error);
            alert("No se pudo conectar con el servidor. Revisa que Flask esté corriendo en http://localhost:5000");
        }
    };

    return (
        <form onSubmit={handleLogin} id="login_form">
            <h2>Iniciar sesión</h2>
            <div>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                />
            </div>
            <button type="submit">Entrar</button>
        </form>
    );
}

export default Login;