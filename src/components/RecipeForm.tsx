import { Key, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from './BackButton.tsx';

function RecipeForm({ newRecipe, initialRecipe, user, onSave }) {

    const navigate = useNavigate();

    const [recipe, setRecipe] = useState(
        initialRecipe
            ? { ...initialRecipe, created_by: initialRecipe.created_by }
            : { title: "", description: "", imageUrl: "", created_by: user?.username || "", ingredients: [] }
    );

    const [ingredient, setIngredient] = useState("");

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (onSave) {
            await onSave(recipe);
            navigate("/");
        }
    };

    const addIngredient = () => {
        if (ingredient.trim() !== "") {
            setRecipe({
                ...recipe,
                ingredients: [...recipe.ingredients, ingredient.trim()]
            });
            setIngredient("");
        }
    };

    const removeIngredient = (index: Key) => {
        setRecipe({
            ...recipe,
            ingredients: recipe.ingredients.filter((_: string, i: Key) => i !== index)
        });
    };

    // same form for new recipe and edit recipe
    return (
        <div id="new_recipe_form">
            <form onSubmit={handleSubmit}>
                {newRecipe ? <h1>Nueva receta</h1> : <h1>Editar receta</h1>}

                <label htmlFor="recipe_name">Nombre de la receta:</label><br />
                <input
                    type="text"
                    name="recipe_name"
                    id="recipe_name"
                    value={recipe.title}
                    onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                /><br />

                <label htmlFor="recipe_description">Descripción:</label><br />
                <input
                    type="text"
                    name="recipe_description"
                    id="recipe_description"
                    value={recipe.description}
                    onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                /><br />

                <label htmlFor="recipe_image_url">Imágen de la receta:</label><br />
                <input
                    type="text"
                    name="recipe_image_url"
                    id="recipe_image_url"
                    value={recipe.imageUrl}
                    onChange={(e) => setRecipe({ ...recipe, imageUrl: e.target.value })}
                /><br />

                <label htmlFor="ingredients">Ingredientes:</label><br />
                <input
                    type="text"
                    id="ingredients"
                    value={ingredient}
                    onChange={(e) => setIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                />
                <button type="button" onClick={addIngredient}>Añadir</button>

                <ul>
                    {recipe.ingredients.map((ing: string, index: Key) => (
                        <li key={index}>
                            {ing} <button type="button" onClick={() => removeIngredient(index)}>❌</button>
                        </li>
                    ))}
                </ul>

                <button type="submit">Guardar receta</button>
            </form>
            <BackButton />
        </div>
    );
}

export default RecipeForm;
