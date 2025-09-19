import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useNotification } from "./Contexts.tsx";
import {User} from "../Types.ts"

type LoginProps = {
    onLogin: (token: string, user: User) => void;
};

// Personal project developed by Daniel Godoy
// https://github.com/DanielGodoyGalindo

function Login(onLogin:LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login, logout } = useUser();
    const { alert } = useNotification();


    const handleLogin = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.status === 401) {
                logout();
                alert("Sesión expirada", "error");
                throw new Error("Sesión expirada");
            }

            const data = await res.json();

            if (res.ok) {
                const loggedUser = { username, role: data.user.role };
                login(data.access_token, loggedUser);
                navigate("/");
            } else {
                alert(data.msg || "Error al iniciar sesión", "error");
            }
        } catch (error) {
            console.error("Error de conexión con backend:", error);
            alert("No se pudo conectar con el servidor. Revisa que Flask esté corriendo en http://localhost:5000", "error");
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