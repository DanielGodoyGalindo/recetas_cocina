import { Key, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from './BackButton.tsx';

function RecipeForm({ newRecipe, initialRecipe, user, onSave }) {

    const navigate = useNavigate();
    const { id } = useParams(); // get id from params

    const [recipe, setRecipe] = useState(
        initialRecipe
            ? { ...initialRecipe, created_by: initialRecipe.created_by }
            : { title: "", description: "", imageUrl: "", created_by: user?.username || "", ingredients: [] }
    );

    const [ingredient, setIngredient] = useState("");

    // load recipe when editing
    useEffect(() => {
        if (!newRecipe && id) {
            const fetchRecipe = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
                    const data = await res.json();
                    setRecipe(data);
                } catch (err) {
                    console.error("Error cargando receta:", err);
                }
            };
            fetchRecipe();
        }
    }, [newRecipe, id]);

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
                <div id="recipe_form_buttons">
                    <button type="submit" className="back_button">Guardar receta</button>
                    <BackButton />
                </div>
            </form>
        </div>
    );
}

export default RecipeForm;
