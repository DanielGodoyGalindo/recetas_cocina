import { useEffect, useState } from 'react';
import RecipeSearchBar from "./RecipeSearchBar.tsx";
import { Recipe } from "../Types";
import { Link } from 'react-router-dom'; // A progressively enhanced <a href> wrapper to enable navigation with client-side routing.
import { useUser } from './UserContext.tsx';
import { apiFetch } from "../services/Api.ts";

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const { token } = useUser();

  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await apiFetch("/api/recipes");
        setRecipes(data); // not filtered recipes to to show when there's nothing typed
        setFilteredRecipes(data);
      } catch (err) {
        console.error("Error cargando recetas:", err);
      }
    };

    const fetchFavorites = async () => {
      try {
        const data = await apiFetch(`/api/recipes/favorites`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        })
        Array.isArray(data) ? setFavorites(data) : setFavorites([data]); // Ensure data as array
      } catch (e) {
        console.log(`Error cargando favoritos: ${e}`);
      }
    };
    fetchRecipes();
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  console.log(favorites);

  // Returns any item found that matches the user input string
  // Matches are by recipe name, by ingredient or by creator
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

  // Personal project developed by Daniel Godoy
  // https://github.com/DanielGodoyGalindo

  return (
    <div>
      <RecipeSearchBar onSearch={handleSearch} />
      <ul>
        {filteredRecipes.map((recipe) => {
          const isFavorite = favorites.some(fav => fav.id === recipe.id);
          return (
            <Link key={recipe.id} to={`/${recipe.id}`}>
              <li>
                <strong>{recipe.title}</strong> por {recipe.created_by}{" "}
                {isFavorite && "⭐"}
              </li>
            </Link>
          );
        })}
      </ul>
      <p id="recipes_user_information">(Las recetas favoritas aparecen marcadas con una estrella)</p>
    </div>
  );
}

export default Recipes;