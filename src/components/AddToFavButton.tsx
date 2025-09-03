import { useParams } from "react-router-dom";
import { useUser } from "./UserContext.tsx";

function AddToFavButton() {
    const { id } = useParams<{ id: string }>(); // get recipe id from url
    const { token } = useUser();

    const handleClick = async () => {
        try {
            // Token check
            if (!token) {
                alert("No hay token, el usuario no está autenticado");
                return;
            }
            // Call backend with recipe id
            const response = await fetch("http://localhost:5000/api/recipes/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipe_id: id }),
            });

            // Getting response from backend
            const data = await response.json();
            if (!response.ok) {
                console.error("Error al añadir favorito:", data.msg || data.message);
                return;
            }
            alert(`${data.message}`);
            
        } catch (e) {
            console.error(`Error añadiendo la receta a favoritos: ${e}`);
        }
    };

    return (
        <button type="button" onClick={handleClick}>❤️ Añadir a favoritos</button>
    );
}

export default AddToFavButton;
