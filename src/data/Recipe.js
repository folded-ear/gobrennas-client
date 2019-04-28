import Immutable from 'immutable';

const Recipe = Immutable.Record({
  id: '',
  title: '',
  external_url: '',
  ingredients: '',
  directions: ''
});

export default Recipe;