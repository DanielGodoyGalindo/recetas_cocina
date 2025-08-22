import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton.tsx";

function CreateUserForm() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"), // 🔹 JWT
                },
                body: JSON.stringify({ username: name, password }),
            });

            if (!response.ok) {
                throw new Error("Error al crear usuario");
            }

            const data = await response.json();
            console.log(data.msg);

            navigate("/");
        } catch (err) {
            console.error(err);
            throw new Error("No se pudo crear el usuario");
        }
    };

    return (
        <div>
            <h2>Crear nuevo usuario</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Nombre:</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                    required
                />

                <label htmlFor="password">Contraseña:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                />

                <button type="submit">Guardar</button>
            </form>

            <BackButton />
        </div>
    );
}

export default CreateUserForm;