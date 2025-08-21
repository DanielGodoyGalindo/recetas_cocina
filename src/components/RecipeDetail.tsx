import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "./BackButton.tsx";
import { Recipe, User } from "../Types"; // centraliza en types.ts

interface RecipeDetailProps {
  token: string | null;
  user: User | null;
  onDelete: (recipe: Recipe, token: string | null) => Promise<void>;
}

function RecipeDetail({ token, user, onDelete }: RecipeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

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

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (recipe) {
      await onDelete(recipe, token);
      navigate("/");
    }
  };

  if (!recipe) return <p>Cargando receta...</p>;

  return (
    <div className="recipe_detail">
      <h1>{recipe.title}</h1>
      <img
        src={recipe.imageUrl}
        alt={recipe.title}
        style={{ maxWidth: "400px" }}
      />
      <p>
        <strong>Descripción:</strong> {recipe.description}
      </p>

      <h2>Ingredientes</h2>
      {Object.keys(recipe.ingredients).length > 0 ? (
        <ul>
          {Object.entries(recipe.ingredients).map(([name, quantity]) => (
            <li key={name}>
              {quantity} {name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No se han añadido ingredientes.</p>
      )}

      <div className="buttons">
        {user && (user.role === "admin" || user.username === recipe.created_by) && (
          <>
            <button onClick={() => navigate(`/edit_recipe/${recipe.id}`)}>
              ✏️ Editar
            </button>
            <button onClick={handleDelete}>🗑️ Eliminar</button>
          </>
        )}
        <BackButton />
      </div>
    </div>
  );
}

export default RecipeDetail;
