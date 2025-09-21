import { useEffect, useState } from 'react';
import RecipeSearchBar from "./RecipeSearchBar.tsx";
import { Recipe } from "../Types";
import { Link } from 'react-router-dom';
import { useUser } from './Contexts.tsx';
import { apiFetch } from "../services/Api.ts";
import RecipePagination from "./RecipePagination.tsx"

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [favoritesFilter, setFavoritesFilter] = useState<"todos" | "favoritos" | "no_favoritos">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [finalRecipes, setFinalRecipes] = useState<Recipe[]>([]);
  const { token } = useUser();
  const [page, setPage] = useState(1);
  const recipesPerPage = 4;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await apiFetch("/api/recipes");
        setRecipes(data);
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
        });
        Array.isArray(data) ? setFavorites(data) : setFavorites([data]);
      } catch (e) {
        console.log(`Error cargando favoritos: ${e}`);
      }
    };

    fetchRecipes();
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  // hook used to filter recipes first by user input then by select element
  useEffect(() => {
    let filtered = recipes.filter(recipe => {
      const nameMatch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
      const ingredientMatch = Object.keys(recipe.ingredients).some((ingredient) =>
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const creatorMatch = recipe.created_by.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || ingredientMatch || creatorMatch;
    });

    filtered = filtered.filter(recipe => {
      const isFavorite = favorites.some(fav => fav.id === recipe.id);
      if (favoritesFilter === "favoritos") return isFavorite;
      if (favoritesFilter === "no_favoritos") return !isFavorite;
      return true;
    });

    setFinalRecipes(filtered);
  }, [recipes, favorites, searchTerm, favoritesFilter]);

  const indexOfLastRecipe = page * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = finalRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);


  return (
    <div>
      <RecipeSearchBar onSearch={setSearchTerm} />
      <div id='select_recipes_container'>
        <span>Filtrar:</span>
        <select value={favoritesFilter} onChange={(e) => setFavoritesFilter(e.target.value as any)}>
          <option value="todos">Todos</option>
          <option value="favoritos">Sólo favoritos</option>
          <option value="no_favoritos">No favoritos</option>
        </select>
      </div>
      <ul>
        {currentRecipes.length > 0 ? (
          currentRecipes.map((recipe) => {
            const isFavorite = favorites.some(fav => fav.id === recipe.id);
            return (
              <Link key={recipe.id} to={`/${recipe.id}`}>
                <li>
                  <strong>{recipe.title}</strong> por {recipe.created_by}{" "}
                  {isFavorite && "⭐"}
                </li>
              </Link>
            );
          })
        ) : (
          <li>No se encontraron recetas 😕</li>
        )}
      </ul>

      {/* pagination */}
      <RecipePagination
        total={finalRecipes.length}
        perPage={recipesPerPage}
        page={page}
        onChange={(event, value) => setPage(value)}
      />
      <p id="recipes_user_information">(Las recetas favoritas aparecen marcadas con una estrella)</p>
      <div id="generate_recipe_own_ingredients_button">
        <Link to={"/generate_recipe"}>Generar receta con mis ingredientes</Link>
      </div>
    </div>
  );
}

export default Recipes;
