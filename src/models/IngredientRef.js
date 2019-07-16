import { Record } from "immutable"
import Ingredient from "./Ingredient"
import PropTypes from "prop-types"

const IngredientRef = Record({
  quantity: '',
  units: '',
  preparation: '',
  ingredient: Ingredient,
    raw: '',
})

export const refType = PropTypes.shape({
    raw: PropTypes.string.isRequired,
    quantity: PropTypes.number,
    units: PropTypes.string,
    ingredientId: PropTypes.number,
    preparation: PropTypes.string,
})

export default IngredientRef