import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from './BackButton.tsx';
import { Recipe, Step, User } from "../Types";
import { useUser } from "./Contexts.tsx";

interface RecipeFormProps {
  newRecipe: boolean;
  user: User;
  initialRecipe?: Recipe;
  onSave: (formData: FormData) => Promise<void>;
}

function RecipeForm({ newRecipe, initialRecipe, onSave }: RecipeFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [recipe, setRecipe] = useState<Recipe>(initialRecipe
    ? { ...initialRecipe, steps: initialRecipe.steps || [], ingredients: initialRecipe.ingredients || {} }
    : { title: "", description: "", imagePath: "", created_by: user?.username || "", ingredients: {}, steps: [] }
  );

  const [ingredientName, setIngredientName] = useState<string>("");
  const [ingredientQuantity, setIngredientQuantity] = useState<string>("");
  const [stepDescription, setStepDescription] = useState<string>("");
  const [stepDuration, setStepDuration] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!newRecipe && id) {
      const fetchRecipe = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
          const res2 = await fetch(`http://localhost:5000/api/recipes/${id}/steps`);
          const data = await res.json();
          const data2 = await res2.json();
          setRecipe({ ...data, ingredients: data.ingredients || {}, steps: data2 || [] });
        } catch (err) {
          console.error("Error cargando receta:", err);
        }
      };
      fetchRecipe();
    }
  }, [newRecipe, id]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("title", recipe.title || "");
  formData.append("description", recipe.description || "");
  formData.append("created_by", recipe.created_by || "admin");
  formData.append("ingredients", JSON.stringify(recipe.ingredients || {}));
  formData.append("steps", JSON.stringify(recipe.steps || []));

  if (imageFile) {
    formData.append("image", imageFile);
  }
  await onSave(formData);
  navigate("/");
};

  // INGREDIENTES
  const addIngredient = () => {
    if (ingredientName.trim() && ingredientQuantity.trim()) {
      setRecipe({
        ...recipe,
        ingredients: {
          ...recipe.ingredients,
          [ingredientName.trim()]: ingredientQuantity.trim()
        }
      });
      setIngredientName("");
      setIngredientQuantity("");
    }
  };

  const removeIngredient = (name: string) => {
    const updatedIngredients = { ...recipe.ingredients };
    delete updatedIngredients[name];
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  // STEPS
  const addStep = () => {
    if (stepDescription.trim()) {
      const durationMin = parseInt(stepDuration) || 0;
      const newStep: Step = {
        id: Date.now(), // generate random id, when backend saves it autoincrements
        recipe_id: recipe.id || 0,
        position: recipe.steps.length + 1,
        instruction: stepDescription.trim(),
        duration_min: durationMin
      };
      setRecipe({
        ...recipe,
        steps: [...recipe.steps, newStep]
      });
      setStepDescription("");
      setStepDuration("");
    }
  };

  const removeStep = (id: number) => {
    setRecipe({
      ...recipe,
      steps: recipe.steps.filter((s) => s.id !== id)
    });
  };

  return (
    <div id="new_recipe_form">
      <form onSubmit={handleSubmit}>
        <h1>{newRecipe ? "Nueva receta" : "Editar receta"}</h1>
        {/* name */}
        <label htmlFor="recipe_name">Nombre de la receta:</label><br />
        <input
          type="text"
          id="recipe_name"
          className="recipe_form_input"
          value={recipe.title}
          onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
        /><br />
        {/* description */}
        <label htmlFor="recipe_description">Descripción:</label><br />
        <input
          type="text"
          id="recipe_description"
          className="recipe_form_input"
          value={recipe.description}
          onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
        /><br />
        {/* image */}
        <label htmlFor="recipe_image_path">Imagen de la receta:</label><br />
        <input
          type="file"
          id="recipe_image_path"
          className="recipe_form_input"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              setRecipe({ ...recipe, imagePath: file.name });
            }
          }}
        /><br />

        {/* INGREDIENTES */}
        <label>Ingredientes:</label><br />
        <input
          type="text"
          placeholder="Ingrediente"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Cantidad"
          value={ingredientQuantity}
          onChange={(e) => setIngredientQuantity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
        />
        <button type="button" onClick={addIngredient}>Añadir</button>

        <ul>
          {Object.entries(recipe.ingredients).map(([name, quantity]) => (
            <li key={name}>
              {name}: {quantity}{" "}
              <button type="button" onClick={() => removeIngredient(name)}>❌</button>
            </li>
          ))}
        </ul>

        {/* STEPS */}
        <label>Pasos:</label><br />
        <input
          type="text"
          placeholder="Indica el siguiente paso"
          value={stepDescription}
          onChange={(e) => setStepDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Duración (min)"
          value={stepDuration}
          onChange={(e) => setStepDuration(e.target.value)}
          min="0"
        />
        <button type="button" onClick={addStep}>Añadir</button>

        <ol>
          {recipe.steps.map((s) => (
            <li key={s.id}>
              {s.instruction}{" "}
              {s.duration_min ? "(" + s.duration_min + " min)" : ""}
              <button type="button" onClick={() => removeStep(s.id)}>❌</button>
            </li>
          ))}
        </ol>

        <div id="recipe_form_buttons">
          <button type="submit" className="back_button">Guardar receta</button>
          <BackButton />
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;