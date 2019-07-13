import { Record } from 'immutable';
import { arrayOf } from "prop-types";
import IngredientRef from "./IngredientRef";

const Recipe = Record({
  id: '',
  type: 'Recipe',
  name: '',
  displayTitle: '',
    rawIngredients: '',
  externalUrl: '',
  ingredients: arrayOf(IngredientRef),
  directions: ''
});

export default Recipe;