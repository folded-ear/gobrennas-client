import { Record } from 'immutable';

const Recipe = Record({
  id: '',
  type: '',
  name: '',
  title: '',
  external_url: '',
  ingredients: [],
  directions: ''
});

export default Recipe;