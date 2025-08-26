import { useEffect, useState } from 'react';
import RecipeSearchBar from "./RecipeSearchBar.tsx";
import { Recipe } from "../Types";
import { Link } from 'react-router-dom'; // A progressively enhanced <a href> wrapper to enable navigation with client-side routing.

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recipes");
        const data = await res.json();
        setRecipes(data); // not filtered recipes to to show when there's nothing typed
        setFilteredRecipes(data);
      } catch (err) {
        console.error("Error cargando recetas:", err);
      }
    };
    fetchRecipes();
  }, []);

  // Returns any item found that matches the user input string
  const handleSearch = (searchTerm: string) => {
    const filtered = recipes.filter(recipe => {
      const nameMatch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
      const ingredientMatch = Object.keys(recipe.ingredients).some((ingredient) =>
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const creatorMatch = recipe.created_by.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || ingredientMatch || creatorMatch;
    });
    setFilteredRecipes(filtered);
  };

  return (
    <div>
      {/* Every time the user types something, handleSearch is executed */}
      <RecipeSearchBar onSearch={handleSearch} />
      <ul>
        {filteredRecipes.map((recipe) => (
          <Link to={`/${recipe.id}`}><li key={recipe.id}>
            <strong>{recipe.title}</strong> por {recipe.created_by}
          </li></Link>
        ))}
      </ul>
    </div>
  );
}

export default Recipes;