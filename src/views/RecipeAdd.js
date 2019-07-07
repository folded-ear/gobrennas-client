import React, { Component } from 'react';
import RecipeForm from "../containers/RecipeForm";

class RecipeAdd extends Component {
  
  render() {
    return (
      <div>
        <h2>Add New Recipe</h2>
        <div>
          <RecipeForm />
        </div>
      </div>
    );
  }
}

export default RecipeAdd;