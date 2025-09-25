import { useState } from "react";
import { Recipe } from "../Types";
import { useUser } from "./Contexts.tsx";
import BackButton from "./BackButton.tsx"
import { Link, useNavigate } from "react-router-dom";

// generate new recipes with the input ingredients of the user
function GenerateRecipesForm() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { token } = useUser();
  const navigate = useNavigate();

  const handleSearch = async (e: { preventDefault: () => void; }) => {
    if (e) {
      e.preventDefault();
    }
    try {
      const res = await fetch("http://localhost:5000/api/recipes/generate_recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ingredients })
      });
      const dbData = await res.json();
      const aiRes = await fetch("http://localhost:5000/api/recipes/generate_ai_recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ingredients }),
      });
      const aiData = await aiRes.json();
      setRecipes([...dbData, ...aiData]);
    } catch (err) {
      console.error("Error buscando recetas:", err);
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
      <div id="generate_recipes_info_container">
        <span>Escribe aquí los ingredientes que tengas por casa (separados por una coma) y haz clic en el botón de buscar.</span><br />
        <span>Aparecerán todas las recetas que tenemos guardadas para que sepas cuales puedes preparar 😊 </span><br />
        <span>También aparecerán recetas recomendadas por nuestro asistente 🤖 </span>
      </div>
      <form id="generate_recipes_input_container">
        <input
          type="text"
          placeholder="Ej: huevos, tomate, arroz"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar recetas</button>
      </form>
      <ul>
        {recipes.length > 0 ? (
          recipes.map((recipe) =>
            // ia recipes with id >= 1000
            recipe.id && recipe.id >= 1000 ? (
              <li key={recipe.id}>
                <button onClick={() => handleClickAIRecipe(recipe)}>
                  {recipe.title}
                </button>
              </li>
            ) : (
              // db recipes
              <li key={recipe.id}>
                <Link to={`/${recipe.id}`}>{recipe.title}</Link>
              </li>
            )
          )
        ) : (
          <p>No hay resultados aún.</p>
        )}
      </ul>
      <div className="centered">
        <BackButton />
      </div>
    </div>
  );
}

export default GenerateRecipesForm;
