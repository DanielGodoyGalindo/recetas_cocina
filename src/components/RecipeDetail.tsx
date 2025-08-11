import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Define data type (Recipe)
interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
}

function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/recipes/${id}`)
      .then(res => res.json())
      .then(data => setRecipe(data));
  }, [id]);

  if (!recipe) return <p>Cargando receta...</p>;

  return (
    <div id='recipeDetail'>
      <div>
        <h2>{recipe.title}</h2>
        <p>{recipe.description}</p>
      </div>
      <div>
        <h3>Ingredientes:</h3>
        <ul>
          {recipe.ingredients.map((ingredient, idx) => (
            <li key={idx}>{ingredient}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RecipeDetail;