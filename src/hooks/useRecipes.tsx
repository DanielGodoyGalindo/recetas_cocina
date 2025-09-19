import { useNotification } from "../components/Contexts.tsx";
import { createRecipe, updateRecipe, deleteRecipe } from "../services/recipes.tsx";

export function useRecipes(token: string, logout: () => void) {
    const { alert } = useNotification();

    const handleSaveRecipe = async (id: number | undefined, formData: FormData): Promise<void> => {
        try {
            const data = await createRecipe(formData, token);
            alert(data.message, "success");
            return data;
        } catch (err: any) {
            alert(`No se pudo crear la receta: ${err.message}`, "error");
            throw err;
        }
    };

    const handleEditRecipe = async (id: number, formData: FormData) => {
        try {
            const data = await updateRecipe(id, formData, token);
            alert(data.msg, "success");
            return data;
        } catch (err: any) {
            if (err.message.includes("401")) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.", "info");
                logout();
            } else {
                alert(`No se pudo actualizar la receta: ${err.message}`, "error");
            }
            throw err;
        }
    };

    const handleDeleteRecipe = async (id: number) => {
        try {
            await deleteRecipe(id, token);
            alert("Receta eliminada con éxito", "success");
        } catch (err: any) {
            alert(`No se pudo eliminar la receta: ${err.message}`, "error");
            throw err;
        }
    };

    return { handleSaveRecipe, handleEditRecipe, handleDeleteRecipe };
}