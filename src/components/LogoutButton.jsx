import { useNavigate } from "react-router-dom";

function LogoutButton({ onLogout, user }) {
    const navigate = useNavigate();

    // when logging out
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (onLogout) onLogout();
        navigate("/login");
    };

    const handleNewRecipe = () => {
        navigate("/new_recipe");
    };

    return (
        <div id="container_logout_button">
            <span id="user_message">{user ? `Hola, ${user.username}` : "No hay usuario"}</span>
            <button onClick={handleNewRecipe} id="new_recipe_button">Nueva receta</button>
            <button onClick={handleLogout} id="logout_button">Cerrar sesión</button>
        </div>
    );
}

export default LogoutButton;