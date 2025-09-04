import { useParams } from "react-router-dom";
import { useUser } from "./UserContext.tsx";
import { apiFetch } from "../services/Api.ts";
import { useEffect, useState } from "react";


function AddToFavButton() {
    const { id } = useParams<{ id: string }>(); // get recipe id from url
    const { token } = useUser();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (!token) return;
        apiFetch(`/api/recipes/favorites/${id}/check`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((data) => setIsFavorite(data.is_favorite))
            .catch((e) => console.error(e));
    }, [id, token]);

    const handleClickAdd = () => {
        // Token check
        if (!token) {
            alert("No hay token, el usuario no está autenticado");
            return;
        }
        // Call backend with recipe id
        apiFetch("/api/recipes/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ recipe_id: id }),
        })
            // Getting response from backend
            .then(() => setIsFavorite(true))
            .catch((e) => console.error(e));
    }

    const handleClickDelete = () => {
        apiFetch(`/api/recipes/favorites/${id}`, {
            method: "DELETE",
            body: JSON.stringify({ recipe_id: id }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                setIsFavorite(false);
            })
            .catch(e => console.error("Error quitando favorito:", e))
    }

    // Show appropriate button
    return (
        <div>
            {isFavorite ? (
                <button type="button" onClick={handleClickDelete}>❌ Quitar de favoritos</button>
            ) : (
                <button type="button" onClick={handleClickAdd}>❤️ Añadir a favoritos</button>
            )}
        </div>
    );
};

export default AddToFavButton;
