import { useNavigate } from "react-router-dom";

type EditRecipeButtonProps = {
  recipeId: number;
};

function EditRecipeButton({ recipeId }: EditRecipeButtonProps) {
  const navigate = useNavigate();

  const handleEditRecipe = () => {
    navigate(`/edit_recipe/${recipeId}`);
  };

  return (
    <button onClick={handleEditRecipe} id="edit_recipe_button">
      Editar receta ✏️
    </button>
  );
}

export default EditRecipeButton;