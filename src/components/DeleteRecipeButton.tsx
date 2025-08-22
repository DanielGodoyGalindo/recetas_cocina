import React from "react";
import { useNavigate } from "react-router-dom";

type DeleteRecipeButtonProps = {
    recipeId: number;
    token: string | null;
    user: any;
    onDelete: (recipeData: { id: number }, token: string | null, user: string) => void;
};

function DeleteRecipeButton({ recipeId, token, user, onDelete }: DeleteRecipeButtonProps) {

    const navigate = useNavigate();

    const handleClick = () => {
        const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta receta?");
        if (confirmDelete) {
            onDelete({ id: recipeId }, token, user);
        }
        navigate("/");
    }

    return (
        <button onClick={handleClick} id="delete_recipe_button">
            Eliminar receta ❌
        </button>
    );
}

export default DeleteRecipeButton;