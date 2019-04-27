import React, { Component } from 'react';
import axios from 'axios';

function getRecipes() {
  return axios.get('/api/recipe/all');
}

class Recipes extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      recipes: []
    }
  }
  
  componentDidMount() {
    getRecipes().then(result => {
      console.log(result.data);
      this.setState({ recipes: result.data });
    });
  }
  
  renderRecipes() {
    const { recipes } = this.state;
    
    return recipes.map( recipe => {
      return (
        <p key={recipe.title}>{recipe.title}</p>
      )
    });
  }
  
  render() {
    return (
      <div>
        <h1>CookBook</h1>
        { this.renderRecipes()}
      </div>
    )
  }
}

export default Recipes;