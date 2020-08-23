import { Record } from "immutable";
import PropTypes from "prop-types";
import Ingredient from "./Ingredient";

const IngredientRef = Record({
  quantity: "",
  units: "",
  preparation: "",
  ingredient: Ingredient,
    raw: "",
});

export const refType = PropTypes.shape({
    raw: PropTypes.string.isRequired,
    quantity: PropTypes.number,
    units: PropTypes.string,
    ingredientId: PropTypes.number,
    preparation: PropTypes.string,
});

export default IngredientRef;