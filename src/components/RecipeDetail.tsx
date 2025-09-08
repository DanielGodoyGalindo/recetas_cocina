import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "./BackButton.tsx";
import { Recipe, Comment, Step } from "../Types";
import { useUser, useNotification } from "./Contexts.tsx";
import AddToFavButton from "./AddToFavButton.tsx";
import ShareButtons from "./ShareButtons.tsx";

interface RecipeDetailProps {
  onDelete: (recipeId: number) => Promise<void>;
}

function RecipeDetail({ onDelete }: RecipeDetailProps) {

  // Hooks
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useUser();
  const { alert } = useNotification();

  // States
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newVote, setNewVote] = useState(5);
  const [steps, setSteps] = useState<Step[]>([]);

  // Variables
  const isCreator = user?.username === recipe?.created_by;
  const isAdmin = user?.role === "admin";

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

    const fetchSteps = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/${id}/steps`);
        const data = await res.json();
        setSteps(data);
      } catch (e) {
        console.log(`Error obteniendo los pasos de la receta: ${e}`);
      }
    };

    fetchRecipe();
    fetchComments();
    fetchSteps();
  }, [id]);

  const handleDelete = async () => {
    if (recipe?.id !== undefined) {
      await onDelete(recipe.id);
      navigate("/");
    }
  };

  const handleAddComment = async () => {
    if (!newComment || !newVote) return;

    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipe?.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ text_comment: newComment, vote: newVote }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al añadir comentario");
      }

      const addedComment = await res.json();
      setComments([...comments, addedComment]);
      setNewComment("");
      setNewVote(5);
    } catch (err) {
      console.error(err);
      alert("No se pudo añadir el comentario", "error");
    }
  };

  if (!recipe) return <p>Cargando receta...</p>;

  // Personal project developed by Daniel Godoy
  // https://github.com/DanielGodoyGalindo

  return (
    <div className="recipe_detail">
      <h1>{recipe.title}</h1>
      <div className="recipe_details_image">
        <div className="recipe_detail_main">
          <p><strong>Descripción:</strong> {recipe.description}</p>

          {/* Ingredients list */}
          <h3>Ingredientes</h3>
          {Object.keys(recipe.ingredients).length > 0 ? (
            <ul>
              {Object.entries(recipe.ingredients).map(([name, quantity]) => (
                <li key={name}>
                  {name}: {quantity}
                </li>
              ))}
            </ul>
          ) : (
            <p>No se han añadido ingredientes.</p>
          )}

          {/* Buttons */}
          <div className="recipe_buttons">
            {user && (user.role === "admin" || user.username === recipe.created_by) && (
              <>
                <button className="recipe_button" onClick={() => navigate(`/edit_recipe/${recipe.id}`)}>✏️ Editar</button>
                <button className="recipe_button" onClick={handleDelete}>🗑️ Eliminar</button>
              </>
            )}
            <AddToFavButton />
          </div>

        </div>

        <img src={recipe.imageUrl} alt={recipe.title} className="image_sample" />
      </div>

      {/* Steps */}
      <div id="steps_container">
        <h3 style={{ textAlign: "center" }}>Pasos</h3>
        <ol>
          {steps.map((step) => (
            <li key={step.position}>
              {step.instruction} <strong>{"(" + step.duration_min} {" min)"}</strong>
            </li>
          ))}
        </ol>
        <span>
          <i><strong>Tiempo total:{" "}
            {steps.reduce((total, step) => total + step.duration_min, 0)} min</strong></i>
        </span>
      </div>

      <div>
        <ShareButtons recipe={recipe} />
      </div>

      {/* Comments */}
      <div id="comments_container">
        <h3>Comentarios</h3>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div className="recipe_comment" key={comment.id}>
              <p>{comment.text_comment} ({comment.vote}⭐)</p>
              <p id="p_comment"><strong>- {comment.username}</strong></p>
            </div>
          ))
        ) : (
          <p>No hay comentarios aún.</p>
        )}
      </div>

      {(isAdmin || !isCreator) && (
        <div id="add_comment_container">
          <h4>Deja tu comentario</h4>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
          />
          <div id="vote_input_button">
            <select value={newVote} onChange={(e) => setNewVote(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}⭐</option>
              ))}
            </select>
            <button onClick={handleAddComment}>Añadir comentario</button>
          </div>
        </div>
      )}

      {(!isAdmin && isCreator) && <p>No puedes comentar tu propia receta.</p>}

      <BackButton />
    </div>
  );
}

export default RecipeDetail;