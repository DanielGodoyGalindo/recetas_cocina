import './App.css';
import Recipes from './components/Recipes.tsx';
import RecipeDetail from './components/RecipeDetail.tsx';
import WelcomeMessage from './components/WelcomeMessage';
import RecipeForm from "./components/RecipeForm.tsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Login from "./components/Login";
import { useState } from "react";

function App() {

  // State
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // send new recipe
  const handleSaveRecipe = async (recipeData) => {
    console.log("Datos de la receta a enviar:", recipeData);

    try {
      const res = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(data.msg || "Error al crear receta");
      }

      alert("Receta creada correctamente!");
    } catch (err) {
      console.error("Error capturado:", err);
      alert(`No se pudo crear la receta: ${err.message}`);
    }
  };

  const handleEditRecipe = async (recipeData, token) => {
    console.log("PUT URL:", `http://localhost:5000/api/recipes/${recipeData.id}`);
    console.log("Token:", token);

    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(data.msg || "Error al actualizar receta");
      }
      alert("Receta actualizada correctamente!");
    } catch (err) {
      console.error("Error capturado:", err);
      alert(`No se pudo actualizar la receta: ${err.message}`);
    }
  };

  return (
    <Router>
      <Routes>
        <Route element={<Layout token={token} onLogout={handleLogout} user={user} />}>
          <Route path="/" element={token ? [<WelcomeMessage />, <Recipes />] : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login onLogin={(token, user) => {
            setToken(token);
            setUser(user);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
          }}
          />}
          />
          <Route path="/:id" element={<RecipeDetail />} />
          <Route path="/new_recipe" element={<RecipeForm
            newRecipe={true}
            user={user}
            onSave={handleSaveRecipe} />}
          />
          <Route path="/edit_recipe/:id" element={<RecipeForm
            newRecipe={false}
            user={user}
            onSave={(recipe) => handleEditRecipe(recipe, token)} />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;