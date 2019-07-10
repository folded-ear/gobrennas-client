import React from 'react'

const Augment = ({text, prefix, suffix}) => text
    ? <React.Fragment>{prefix}{text}{suffix}</React.Fragment>
    : null;

const IngredientItem = ({ingredient}) => {

    if (ingredient.ingredient == null) {
        return <span>{ingredient.raw}</span>
    }

  return (
    <span>
        <Augment text={ingredient.quantity}
                 suffix=" " />
        <Augment text={ingredient.units}
                 suffix=" " />
        {ingredient.ingredient.name}
        <Augment text={ingredient.preparation}
                 prefix=", " />
    </span>
  )
};

export default IngredientItem;