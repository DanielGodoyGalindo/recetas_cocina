import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Recipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/recipes')
      .then(res => res.json())
      .then(data => setRecipes(data));
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
