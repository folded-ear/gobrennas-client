import React, {Component} from 'react';
import RecipeApi from '../data/RecipeApi';
import RecipeDetail from "./RecipeDetail";
import {Spin} from "antd";

class RecipesList extends Component<{}> {
  
  handleSelect = (id) => {
    RecipeApi.selectRecipe(id);
  };
  
  handleDelete = (id) => {
    RecipeApi.deleteRecipe(id);
  };
  
  render() {
    const { libraryLO } = this.props;
    const selected = this.props.recipes.get('selected');
    
    if (!libraryLO.hasValue()) {
        return <Spin tip="Loading recipe library..."/>
    }
    
    if (selected) {
      const recipe = library.find(recipe => {
        return recipe.get('id') === selected;
      });

      if (recipe) {
        return <RecipeDetail
            recipe={recipe}
            onDelete={this.handleDelete}
            onSelect={this.handleSelect}
        />
      }

      return <div>Oops.</div>;
    }
    
      const library = libraryLO.getValueEnforcing();
      return (
        <div className="recipes-list">
          <h1>Recipes</h1>
          {[...library].reverse().map(recipe => (
              <h2
                  key={recipe.ingredientId}
                  onClick={() => this.handleSelect(recipe.ingredientId)}
              >
                {recipe.title}
              </h2>
          ))}
        </div>
    );
  }
}

export default RecipesList;