import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from "./components/Contexts.tsx";
import { useRecipes } from "./hooks/useRecipes.tsx";
import Layout from './components/Layout.tsx';
import Recipes from './components/Recipes.tsx';
import RecipeDetail from './components/RecipeDetail.tsx';
import RecipeForm from "./components/RecipeForm.tsx";
import EditRecipeWrapper from './components/EditRecipeWrapper.tsx';
import CreateUserForm from './components/CreateUserForm.tsx';
import Login from "./components/Login.tsx";
import WelcomeMessage from './components/WelcomeMessage.tsx';

function App() {
  const { token, user, login, logout } = useUser();
  const { handleSaveRecipe, handleEditRecipe, handleDeleteRecipe } = useRecipes(token ?? "", logout);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={token ? [<WelcomeMessage key="welcome" />, <Recipes key="recipes" />] : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={(token, user) => { login(token, user); }} />} />
          <Route path="/:id" element={<RecipeDetail token={token} user={user} onDelete={handleDeleteRecipe} />} />
          <Route path="/new_recipe" element={<RecipeForm newRecipe={true} user={user} onSave={handleSaveRecipe}/>} />
          <Route path="/edit_recipe/:id" element={<EditRecipeWrapper user={user} token={token} onSave={handleEditRecipe} />} />
          <Route path="/create-user" element={<CreateUserForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;