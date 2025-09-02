import { useEffect, useState } from 'react';
import RecipeSearchBar from "./RecipeSearchBar.tsx";
import { Recipe } from "../Types";
import { Link } from 'react-router-dom'; // A progressively enhanced <a href> wrapper to enable navigation with client-side routing.
import { useUser } from './UserContext.tsx';

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const { user, token } = useUser();

  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

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

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/favorites`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        })
        const data = await res.json();
        Array.isArray(data) ? setFavorites(data) : setFavorites([data]); // Ensure data as array
      } catch (e) {
        console.log(`Error cargando favoritos: ${e}`);
      }
    };
    fetchRecipes();
    fetchFavorites();
  }, []);

  console.log(favorites);

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
    </div>
  );
}

export default Recipes;