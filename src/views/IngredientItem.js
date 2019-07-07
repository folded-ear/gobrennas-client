import React from 'react'

const IngredientItem = ({ingredient}) => {

    if (ingredient.ingredient == null) {
        return <div>{ingredient.raw}</div>
    }

  return (
    <div>
        {ingredient.quantity}
        {ingredient.ingredient.name}
        {ingredient.preparation && <React.Fragment>
            {", "}
            {ingredient.preparation}
        </React.Fragment>}
    </div>
  )
};

export default IngredientItem;