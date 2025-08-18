import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from './BackButton.tsx';
import EditRecipeButton from './EditRecipeButton.tsx';

// Define data type (Recipe)
interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  imageUrl: string;
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
      <div className='main_details'>
        <div>
          <h2>{recipe.title}</h2>
          <p>{recipe.description}</p>
          <h3>Ingredientes:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <img className="image_sample" src={recipe.imageUrl || "img/recipe_sample_img.jpg"} alt="Recipe sample" />
        <EditRecipeButton recipeId={recipe.id} />
      </div>
      <BackButton />
    </div>
  );
}

export default RecipeDetail;