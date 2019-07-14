import { Record } from 'immutable'

const Recipe = Record({
  id: '',
  type: 'Recipe',
  name: '',
  displayTitle: '',
  rawIngredients: '',
  externalUrl: '',
  ingredients: [],
  directions: ''
})

export default Recipe