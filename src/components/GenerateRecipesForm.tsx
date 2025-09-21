import { useState } from "react";
import { Recipe } from "../Types";
import { useUser } from "./Contexts.tsx";

// generate new recipes with the input ingredients of the user
function GenerateRecipesForm() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { token } = useUser();

  const handleSearch = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/recipes/generate_recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, },

        body: JSON.stringify({ ingredients })
      });

      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("Error buscando recetas:", err);
    }
  };

  return (
    <div>
      <span>Escribe aquí los ingredientes que tengas por casa (separados por una coma) y haz clic en el botón de buscar.</span><br/>
      <span>Aparecerán todas las recetas que tenemos guardadas para que sepas cuales puedes preparar 😊 </span>
      <div id="generate_recipes_input_container">
        <input
          type="text"
          placeholder="Ej: huevo, tomate, arroz"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />

        <button onClick={handleSearch}>
          Buscar recetas
        </button>
      </div>
      <ul>
        {recipes.length > 0 ? (
          recipes.map((recipe) => <li key={recipe.id}>{recipe.title}</li>)
        ) : (
          <p>No hay resultados aún.</p>
        )}
      </ul>
    </div>
  );
}

export default GenerateRecipesForm;
