import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Define data type (Recipe)
interface Recipe {
  id: number;
  title: string;
}

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch("http://localhost:5000/api/recipes", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecipes(data);
        } else {
          console.error("Respuesta no es un array:", data);
          setRecipes([]);
        }
      });
  }, []);

  return (
    <ul>
      {recipes.map(recipe =>
        <li key={recipe.id}>
          <Link to={`/${recipe.id}`}>{recipe.title}</Link>
        </li>)}
    </ul>
  );
}

export default Recipes;
