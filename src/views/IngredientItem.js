import React from 'react'

const IngredientItem = ({ingredient}) => {

    if (ingredient.ingredient == null) {
        return <span>{ingredient.raw}</span>
    }

  return (
    <span>
        {ingredient.quantity && <React.Fragment>
            {ingredient.quantity}
            {" "}
        </React.Fragment>}
        {ingredient.ingredient.name}
        {ingredient.preparation && <React.Fragment>
            {", "}
            {ingredient.preparation}
        </React.Fragment>}
    </span>
  )
};

export default IngredientItem;