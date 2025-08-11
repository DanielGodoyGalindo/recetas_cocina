import './App.css';
import Recipes from './components/Recipes.tsx';
import RecipeDetail from './components/RecipeDetail.tsx';
import WelcomeMessage from './components/WelcomeMessage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <h1 id='main_title'>Mi App de recetas</h1>
      <Routes>
        <Route path="/" element={[<WelcomeMessage />, <Recipes />]} />
        <Route path="/:id" element={<RecipeDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
