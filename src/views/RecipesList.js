import React from 'react';

function RecipesList(props) {
  return (
    <div>
      {[...props.recipes.get('library').values()].reverse().map(recipe => (
        <p
          key={recipe.id}
        >
          {recipe.title}
        </p>
      ))}
    </div>
  );
}

export default RecipesList;