import React from "react";

function ShareButtons({ recipe }) {
  const recipeUrl = `${window.location.origin}/recipes/${recipe.id}`;
  const text = `🍴 Visita esta receta: ${recipe.title}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${recipeUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(recipeUrl)}&text=${encodeURIComponent(text)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(recipeUrl)}&text=${encodeURIComponent(text)}`;

  return (
    <div id="recipe_share_buttons">
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <button className="recipe_button">🟩 WhatsApp</button>
      </a>
      <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
        <button className="recipe_button">🟦 Telegram</button>
      </a>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
        <button className="recipe_button">⬛ Twitter</button>
      </a>
    </div>
  );
}

export default ShareButtons;
