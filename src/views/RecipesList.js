import React from 'react';
import Actions from '../data/actions';
import {Button} from "antd";

const handleSelect = (id) => {
  Actions.selectRecipe(id);
};

const handleDelete = (id) => {
  Actions.deleteRecipe(id);
};

function RecipesList(props) {
  const selected = props.recipes.get('selected');
  const library = props.recipes.get('library');
  
  if(selected) {
    const recipe = library.find( recipe => {
      return recipe.get('id') === selected;
    });
    
    if(recipe) {
      return (
        <div>
          <p onClick={() => handleSelect(null)}>X Close</p>
          <h3>{recipe.get('title')}</h3>
          <p>{recipe.get('external_url')}</p>
          <p>{recipe.get('ingredients')}</p>
          <p>{recipe.get('directions')}</p>
          <Button type="danger" onClick={() => handleDelete(selected)}>Delete Recipe</Button>
        </div>
      )
    }
    
    return (
      <div>Oops.</div>
    )
  }
  
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