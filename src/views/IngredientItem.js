import React from 'react'

const IngredientItem = ({ingredient}) => {

    if (ingredient.ingredient == null) {
        return <div>{ingredient.raw}</div>
    }

  return (
    <div>{ ingredient.quantity } { ingredient.ingredient.name }, {ingredient.preparation}</div>
  )
};

export default IngredientItem;