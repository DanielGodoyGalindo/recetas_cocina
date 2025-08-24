import { useEffect, useState } from 'react';
import RecipeSearchBar from "./RecipeSearchBar.tsx";
import { Recipe } from "../Types";

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recipes");
        const data = await res.json();
        setRecipes(data);
        setFilteredRecipes(data);
      } catch (err) {
        console.error("Error cargando recetas:", err);
      }
    };
    fetchRecipes();
  }, []);

  const handleSearch = (searchTerm: string) => {
    const filtered = recipes.filter((recipe) => {
      const nameMatch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
      const ingredientMatch = Object.keys(recipe.ingredients).some((ing) =>
        ing.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const creatorMatch = recipe.created_by.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || ingredientMatch || creatorMatch;
    });
    setFilteredRecipes(filtered);
  };

  return (
    <div>
      <RecipeSearchBar onSearch={handleSearch} />
      <ul>
        {filteredRecipes.map((recipe) => (
          <li key={recipe.id}>
            <strong>{recipe.title}</strong> por {recipe.created_by}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Recipes;