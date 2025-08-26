import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext";

type DeleteRecipeButtonProps = {
    recipeId: number;
    onDelete: (recipeData: { id: number }) => void;
};

// Personal project developed by Daniel Godoy
// https://github.com/DanielGodoyGalindo

function DeleteRecipeButton({ recipeId, onDelete }: DeleteRecipeButtonProps) {
    const navigate = useNavigate();
    const { token, user } = useUser();

    const handleClick = () => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta receta?");
        if (confirmDelete) {
            onDelete({ id: recipeId });
            navigate("/");
        }
    };

    return (
        <button onClick={handleClick} id="delete_recipe_button">
            Eliminar receta ❌
        </button>
    );
}

export default DeleteRecipeButton;