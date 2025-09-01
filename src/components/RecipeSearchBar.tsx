import { useState } from "react";

interface RecipeSearchBarProps {
    onSearch: (userSearch: string) => void;
}

function RecipeSearchBar({ onSearch }: RecipeSearchBarProps) {

    // state to handle user serch input
    const [userSearch, setUserSearch] = useState("");

    // function to execute when user types text inside the input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserSearch(value);
        onSearch(value);
    };

    return (
        <div id="recipe_search_bar">
            <p>Busca por nombre, ingrediente o creador de la receta:</p>
            <input type="text" placeholder="Escribe para buscar..." value={userSearch} onChange={handleChange} />
        </div>
    );
}

export default RecipeSearchBar;