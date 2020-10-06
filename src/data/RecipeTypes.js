import PropTypes from "prop-types"

export const Ingredient = PropTypes.shape({
    aisle: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string,
    type: PropTypes.string
});

export const IngredientRef = PropTypes.shape({
    quantity: PropTypes.number,
    preparation: PropTypes.string,
    units: PropTypes.string,
    raw: PropTypes.string,
    ingredient: PropTypes.string,
    ingredientId: PropTypes.number,
});

export const Recipe = PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    name: PropTypes.string,
    externalUrl: PropTypes.string,
    ingredients: PropTypes.arrayOf(IngredientRef),
    directions: PropTypes.string,
    yield: PropTypes.number,
    totalTime: PropTypes.number,
    calories: PropTypes.number,
    photo: PropTypes.string
});
