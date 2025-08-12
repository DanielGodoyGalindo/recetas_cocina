import './App.css';
import Recipes from './components/Recipes.tsx';
import RecipeDetail from './components/RecipeDetail.tsx';
import WelcomeMessage from './components/WelcomeMessage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={[<WelcomeMessage />, <Recipes />]} />
          <Route path="/:id" element={<RecipeDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
