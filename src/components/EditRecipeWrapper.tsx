import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RecipeForm from "./RecipeForm.tsx";
import { Recipe, User } from "../Types";

interface EditRecipeWrapperProps {
    user: User | null;
    token: string | null;
    onSave: (recipe: Recipe, token: string | null) => Promise<void>;
}

function EditRecipeWrapper({ user, token, onSave }: EditRecipeWrapperProps) {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        fetch(`http://localhost:5000/api/recipes/${id}`)
            .then(res => res.json())
            .then((data: Recipe) => {
                setRecipe({
                    ...data,
                    ingredients: data.ingredients || {} // 👈 asegura que no sea null/undefined
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Cargando...</p>;

    // Si no hay usuario o no es el creador, redirige al home
    if (!user || !recipe || recipe.created_by !== user.username) {
        return <Navigate to="/" replace />;
    }

    return (
        <RecipeForm
            newRecipe={false}
            user={user}
            initialRecipe={recipe}
            onSave={async (updatedRecipe: Recipe) => {
                await onSave(updatedRecipe, token);
            }}
        />
    );
}

export default EditRecipeWrapper;
