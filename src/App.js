import './App.css';
import Recipes from './components/Recipes.tsx';
import RecipeDetail from './components/RecipeDetail.tsx';
import WelcomeMessage from './components/WelcomeMessage';
import RecipeForm from "./components/RecipeForm.tsx";
import EditRecipeWrapper from './components/EditRecipeWrapper.tsx';
import CreateUserForm from './components/CreateUserForm.tsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Login from "./components/Login";
import { useUser, useNotification } from "./components/Contexts.tsx";

function App() {

  const { token, user, login, logout } = useUser();
  const { alert } = useNotification();


  // Create recipe
  const handleSaveRecipe = async (recipeData) => {
    try {
      const res = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.", "info");
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data.msg || "Error al crear receta");
      }

      alert("Receta creada con éxito!", "success");
    } catch (err) {
      console.error("Error capturado:", err);
      alert(`No se pudo crear la receta: ${err.message}`, "error");
    }
  };

  // Edit recipe
  const handleEditRecipe = async (recipeData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      console.log(res.status);

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.", "info");
        logout();
        return;
      }

      if (res.status === 403) {
        alert("No tienes permiso para editar esta receta", "error");
        return;
      }

      if (res.status === 200) {
        const data = await res.json();
        alert(data.msg, "success");
      }

    } catch (err) {
      console.error("Error capturado:", err);
      alert(`No se pudo actualizar la receta: ${err.message}`, "error");
    }
  };

  // Delete recipe
  const handleDeleteRecipe = async (recipeData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.", "info");
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(data.msg || "Error al eliminar la receta");
      }

      alert("Receta eliminada con éxito", "success");
    } catch (err) {
      console.error("Error capturado:", err);
      alert(`No se pudo eliminar la receta: ${err.message}`, "error");
    }
  };

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={token ? [<WelcomeMessage key="welcome" />, <Recipes key="recipes" />] : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={(token, user) => { login(token, user); }} />} />
          <Route path="/:id" element={<RecipeDetail token={token} user={user} onDelete={handleDeleteRecipe} />} />
          <Route path="/new_recipe" element={<RecipeForm newRecipe={true} user={user} onSave={handleSaveRecipe} />} />
          <Route path="/edit_recipe/:id" element={<EditRecipeWrapper user={user} token={token} onSave={handleEditRecipe} />} />
          <Route path="/create-user" element={<CreateUserForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
