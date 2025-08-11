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
    fetch('http://localhost:5000/api/recipes')
      .then(res => res.json())
      .then((data: Recipe[]) => setRecipes(data));
  }, [setRecipes]);

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
