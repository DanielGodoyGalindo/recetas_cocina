import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "./Contexts.tsx";

function LogoutButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useUser();

    // when logging out
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleNewRecipe = () => {
        navigate("/new_recipe");
    };

    return (
        <div id="container_logout_button">
            <span id="user_message">{user ? `Hola, ${user.username}` : "No hay usuario"}</span>
            {/* only show button when location is "/" */}
            {location.pathname === "/" && (
                <button onClick={handleNewRecipe} id="new_recipe_button">
                    Nueva receta
                </button>
            )}
            <button onClick={handleLogout} id="logout_button">Cerrar sesión</button>
        </div>
    );
}

export default LogoutButton;