import React from 'react';
import {Button} from "antd";

const RecipeDetail = ({recipe, onDelete, onSelect}) => {
  return (
    <div>
      <p onClick={() => onSelect(null)}>X Close</p>
      <h3>{recipe.get('title')}</h3>
      <p>{recipe.get('external_url')}</p>
      <p>{recipe.get('ingredients')}</p>
      <p>{recipe.get('directions')}</p>
      <Button type="danger" onClick={() => onDelete(recipe.get('id'))}>Delete Recipe</Button>
    </div>
  )
};

export default RecipeDetail;