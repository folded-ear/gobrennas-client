import { Record } from 'immutable'

const Recipe = Record({
  id: '',
  type: 'Recipe',
  name: '',
  // rawIngredients: '',
  externalUrl: '',
  ingredients: [],
  directions: ''
})

export default Recipe