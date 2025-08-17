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

  // Estado de sesión
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

      console.log(res.body);

      console.log("Status HTTP:", res.status);

      const data = await res.json(); // parseamos la respuesta
      console.log("Respuesta del backend:", data);

      if (!res.ok) {
        // Si hubo error, lanzamos con mensaje del backend si existe
        throw new Error(data.msg || "Error al crear receta");
      }

      alert("Receta creada correctamente!");
      // Aquí puedes redirigir o actualizar la lista de recetas si quieres
    } catch (err) {
      console.error("Error capturado:", err);
      alert(`No se pudo crear la receta: ${err.message}`);
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
            onSave={handleSaveRecipe}
          />
          }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;