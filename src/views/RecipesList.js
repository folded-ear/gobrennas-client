import React from 'react';
import Actions from '../data/actions';
import RecipeDetail from "./RecipeDetail";

const handleSelect = (id) => {
  Actions.selectRecipe(id);
};

const handleDelete = (id) => {
  Actions.deleteRecipe(id);
};

const RecipesList = (props) => {
  const selected = props.recipes.get('selected');
  const library = props.recipes.get('library');
  
  if(selected) {
    const recipe = library.find( recipe => {
      return recipe.get('id') === selected;
    });
    
    if(recipe) {
      return <RecipeDetail
        recipe={recipe}
        onDelete={handleDelete}
        onSelect={handleSelect}
      />
    }
    
    return <div>Oops.</div>;
  }
  
  return (
    <div className="recipes-list">
      <h1>Recipes</h1>
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
};

export default RecipesList;