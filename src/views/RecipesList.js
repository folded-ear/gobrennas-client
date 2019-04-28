import React from 'react';
import Actions from '../data/actions';

const handleSelect = (id) => {
  Actions.selectRecipe(id);
};

function RecipesList(props) {
  console.log(props);
  return (
    <div className="recipes-list">
      {[...props.recipes.get('library').values()].reverse().map(recipe => (
        <h2
          key={recipe.id}
          onClick={() => handleSelect(recipe.id)}
        >
          {recipe.title}
        </h2>
      ))}
    </div>
  );
}

export default RecipesList;