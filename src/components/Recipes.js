import React, {Component} from 'react';
import axios from 'axios';

function getRecipes() {
  return axios.get('/api/recipe/all');
}

class Recipes extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
      selected: 0
    }
  }
  
  componentDidMount() {
    getRecipes().then(result => {
      console.log(result.data);
      this.setState({recipes: result.data});
    });
  }
  
  selectRecipe(id) {
    this.setState({selected: id});
  }
  
  renderRecipes() {
    const {recipes} = this.state;
    
    return recipes.map(recipe => {
      return (
        <div
          key={recipe.title}
          onClick={() => this.selectRecipe(recipe.id)}
        >
          {recipe.title}
        </div>
      )
    });
  }
  
  renderRecipe() {
    const {selected} = this.state;
    const recipe = this.state.recipes.find(recipe => {
      return recipe.id === selected;
    });
    return recipe ?
      <div>
        <h2>{recipe.title}</h2>
        <p onClick={() => this.selectRecipe(0)}>Close Recipe</p>
        <p>{recipe.external_url}</p>
        <p>{recipe.ingredients}</p>
        <p>{recipe.directions}</p>
      </div> :
      null;
  }
  
  render() {
    const {selected} = this.state;
    
    return (
      <div>
        <h1>CookBook</h1>
        {selected ?
          this.renderRecipe()
          :
          this.renderRecipes()
        }
      </div>
    )
  }
}

export default Recipes;