import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "./BackButton.tsx";
import { Recipe, Comment } from "../Types";
import { useUser } from "../components/UserContext.tsx";

interface RecipeDetailProps {
  onDelete: (recipeId: number) => Promise<void>;
}

function RecipeDetail({ onDelete }: RecipeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
        const data = await res.json();

        setRecipe({
          ...data,
          ingredients: data.ingredients || {},
        });
      } catch (err) {
        console.error("Error cargando receta:", err);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/${id}/comments`);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Error cargando comentarios:", err);
      }
    };

    fetchRecipe();
    fetchComments();

  }, [id]);

  const handleDelete = async () => {
    if (recipe) {
      await onDelete(recipe.id);
      navigate("/");
    }
  };

  if (!recipe) return <p>Cargando receta...</p>;

  return (
    <div className="recipe_detail">
      <h1>{recipe.title}</h1>
      <div className="recipe_details_image">
        <div className="recipe_detail_main">
          <p><strong>Descripción:</strong> {recipe.description}</p>
          <h3>Ingredientes</h3>
          {/* check if recipe object has ingredients */}
          {Object.keys(recipe.ingredients).length > 0 ? (
            <ul>
              {/* converts the object to an array of [key, value] pairs, then loop with .map e.g ["azucar","100gr"]  */}
              {Object.entries(recipe.ingredients).map(([name, quantity]) => (
                <li key={name}>
                  {quantity} {name} {/* 100gr azucar */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No se han añadido ingredientes.</p>
          )}
          <div className="recipe_buttons">
            {user && (user.role === "admin" || user.username === recipe.created_by) && (
              <>
                <button onClick={() => navigate(`/edit_recipe/${recipe.id}`)}>
                  ✏️ Editar
                </button>
                <button onClick={handleDelete}>🗑️ Eliminar</button>
              </>
            )}
          </div>
        </div>
        <img src={recipe.imageUrl} alt={recipe.title} className="image_sample" />
      </div>
      <div id="comments_container">
        <h3>Comentarios</h3>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <p className="recipe_comment" key={comment.id}>
              {comment.text_comment}{" "}
              {"⭐".repeat(comment.vote)}
              <p id="p_comment"><strong>- {comment.username}</strong></p>
            </p>
          ))
        ) : (
          <p>No hay comentarios aún.</p>
        )}
      </div>
      <BackButton />
    </div>
  );
}

export default RecipeDetail;




