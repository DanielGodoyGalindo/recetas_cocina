import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from './BackButton.tsx';
import { Recipe } from "../Types";
import { useUser } from "./UserContext.tsx";

interface RecipeFormProps {
  newRecipe: boolean;
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => Promise<void>;
}

function RecipeForm({ newRecipe, initialRecipe, onSave }: RecipeFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [recipe, setRecipe] = useState<Recipe>(
    initialRecipe
      ? { ...initialRecipe, created_by: initialRecipe.created_by }
      : { title: "", description: "", imageUrl: "", created_by: user?.username || "", ingredients: {} }
  );

  const [ingredientName, setIngredientName] = useState<string>("");
  const [ingredientQuantity, setIngredientQuantity] = useState<string>("");

  useEffect(() => {
    if (!newRecipe && id) {
      const fetchRecipe = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
          const data = await res.json();
          setRecipe({ ...data, ingredients: data.ingredients || {} });
        } catch (err) {
          console.error("Error cargando receta:", err);
        }
      };
      fetchRecipe();
    }
  }, [newRecipe, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      await onSave(recipe);
      navigate("/");
    }
  };

  const addIngredient = () => {
    if (ingredientName.trim() && ingredientQuantity.trim()) {
      setRecipe({
        ...recipe,
        ingredients: {
          ...recipe.ingredients,
          [ingredientName.trim()]: ingredientQuantity.trim()
        }
      });
      setIngredientName("");
      setIngredientQuantity("");
    }
  };

  const removeIngredient = (name: string) => {
    const updatedIngredients = { ...recipe.ingredients };
    delete updatedIngredients[name];
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  return (
    <div id="new_recipe_form">
      <form onSubmit={handleSubmit}>
        <h1>{newRecipe ? "Nueva receta" : "Editar receta"}</h1>

        <label htmlFor="recipe_name">Nombre de la receta:</label><br />
        <input
          type="text"
          id="recipe_name"
          className="recipe_form_input"
          value={recipe.title}
          onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
        /><br />

        <label htmlFor="recipe_description">Descripción:</label><br />
        <input
          type="text"
          id="recipe_description"
          className="recipe_form_input"
          value={recipe.description}
          onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
        /><br />

        <label htmlFor="recipe_image_url">Imagen de la receta:</label><br />
        <input
          type="text"
          id="recipe_image_url"
          className="recipe_form_input"
          value={recipe.imageUrl}
          onChange={(e) => setRecipe({ ...recipe, imageUrl: e.target.value })}
        /><br />

        <label>Ingredientes:</label><br />
        <input
          type="text"
          placeholder="Ingrediente"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Cantidad"
          value={ingredientQuantity}
          onChange={(e) => setIngredientQuantity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
        />
        <button type="button" onClick={addIngredient}>Añadir</button>

        <ul>
          {Object.entries(recipe.ingredients).map(([name, quantity]) => (
            <li key={name}>
              {name}: {quantity}{" "}
              <button type="button" onClick={() => removeIngredient(name)}>❌</button>
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