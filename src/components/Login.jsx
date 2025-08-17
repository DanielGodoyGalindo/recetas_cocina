import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            const loggedUser = { username };
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(loggedUser));
            if (onLogin) onLogin(data.access_token, loggedUser); // call parent component
            navigate("/");
        } else {
            alert(data.msg);
        }
    };

    return (
        <form onSubmit={handleLogin} id="login_form">
            <h2>Iniciar sesión</h2>
            <div>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
            </div>
            <button type="submit">Entrar</button>
        </form>
    );
}

export default Login;