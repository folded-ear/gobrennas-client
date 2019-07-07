import { Record } from "immutable";
import Ingredient from "./Ingredient";

const IngredientRef = Record({
  quantity: '',
  preparation: '',
  ingredient: Ingredient,
    raw: '',
});

export default IngredientRef;