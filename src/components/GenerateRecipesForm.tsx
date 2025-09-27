import { useState } from "react";
import { Recipe } from "../Types";
import { useUser } from "./Contexts.tsx";
import BackButton from "./BackButton.tsx"
import { Link, useNavigate } from "react-router-dom";

// generate new recipes with the input ingredients of the user
function GenerateRecipesForm() {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { token } = useUser();
  const navigate = useNavigate();

  const handleSearch = async (e: { preventDefault: () => void }) => {
    if (e) e.preventDefault();

    setLoading(true);

    try {
      // Promises in parallel
      const [dbRes, aiRes] = await Promise.all([
        fetch("http://localhost:5000/api/recipes/generate_recipe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ingredients }),
        }),
        fetch("http://localhost:5000/api/recipes/generate_ai_recipe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ingredients }),
        }),
      ]);

      const [dbData, aiData] = await Promise.all([dbRes.json(), aiRes.json()]);
      setRecipes([...dbData, ...aiData]);

    } catch (err) {
      console.error("Error buscando recetas:", err);
    } finally {
      setLoading(false);
    }
  };

  // saves recipe in cache
  const handleClickAIRecipe = async (recipe: Recipe) => {
    try {
      await fetch("http://localhost:5000/api/recipes/save_ai_recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(recipe),
      });
      navigate(`/${recipe.id}`);
    } catch (err) {
      console.error("Error guardando receta IA:", err);
    }
  };

  return (
    <div>
      <form id="generate_recipes_input_container">
        <input
          type="text"
          placeholder="Ej: huevos, tomate, arroz"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar recetas</button>
      </form>

      {loading && <p>Cargando recetas... 🔄</p>}

      {!loading && (
        <ul>
          {recipes.length > 0 ? (
            recipes.map((recipe) =>
              recipe.id && recipe.id >= 1000 ? (
                <li key={recipe.id}>
                  <button onClick={() => handleClickAIRecipe(recipe)}>
                    {recipe.title}
                  </button>
                </li>
              ) : (
                <li key={recipe.id}>
                  <Link to={`/${recipe.id}`}>{recipe.title}</Link>
                </li>
              )
            )
          ) : (
            <p>No hay resultados aún.</p>
          )}
        </ul>
      )}
      <div className="centered">
        <BackButton />
      </div>
    </div>
  );
}

export default GenerateRecipesForm;


