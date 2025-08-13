import './App.css';
import Recipes from './components/Recipes.tsx';
import RecipeDetail from './components/RecipeDetail.tsx';
import WelcomeMessage from './components/WelcomeMessage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Login from "./components/Login";
import { useState, useEffect } from "react";


function App() {

  const [token, setToken] = useState(localStorage.getItem("token"));
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={token ? [<WelcomeMessage />, <Recipes />] : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={() => setToken(localStorage.getItem("token"))}/>} />
          <Route path="/:id" element={<RecipeDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
