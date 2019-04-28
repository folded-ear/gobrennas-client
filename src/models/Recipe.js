import { Record } from 'immutable';

const Recipe = Record({
  id: '',
  title: '',
  external_url: '',
  ingredients: '',
  directions: ''
});

export default Recipe;