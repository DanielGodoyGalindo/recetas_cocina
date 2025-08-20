import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from './BackButton.tsx';
import EditRecipeButton from './EditRecipeButton.tsx';
import DeleteRecipeButton from './DeleteRecipeButton.tsx';

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  imageUrl: string;
  created_by: string;
}

interface User {
  id: number;
  username: string;
}

type RecipeDetailProps = {
  token: string | null;
  user: User | null;
  onDelete: (recipeData: { id: number }, token: string | null, user: any) => void;
};

function RecipeDetail({ token, user, onDelete }: RecipeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const navigate = useNavigate();

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
          <div className='recipe_buttons'>
            {token && user && recipe.created_by === user.username && (
              <>
                <EditRecipeButton recipeId={recipe.id} />
                <DeleteRecipeButton
                  recipeId={recipe.id}
                  token={token}
                  user={user}
                  onDelete={(data, tkn, usr) => {
                    onDelete(data, tkn, usr);
                    navigate("/");
                  }}
                />
              </>
            )}
          </div>
        </div>
        <img
          className="image_sample"
          src={recipe.imageUrl || "img/recipe_sample_img.jpg"}
          alt="Recipe sample"
        />
      </div>
      <BackButton />
    </div>
  );
}

export default RecipeDetail;