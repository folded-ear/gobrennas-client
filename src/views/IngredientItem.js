import React from 'react'

const IngredientItem = ({ingredient}) => {
  
  return (
    <p key={ingredient.id}>{ ingredient.quantity } { ingredient.ingredient.name }, {ingredient.preparation}</p>
  )
};

export default IngredientItem;