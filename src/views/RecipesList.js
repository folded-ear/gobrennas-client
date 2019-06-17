import React, {
  Component
} from 'react';
import RecipeApi from '../data/RecipeApi';
import RecipeDetail from "./RecipeDetail";

class RecipesList extends Component<{}> {
  
  componentDidMount() {
    RecipeApi.fetchRecipes();
  }
  
  handleSelect = (id) => {
    RecipeApi.selectRecipe(id);
  };
  
  handleDelete = (id) => {
    RecipeApi.deleteRecipe(id);
  };
  
  render() {
    const selected = this.props.recipes.get('selected');
    const library = this.props.recipes.get('library');
    
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
    
    return (
        <div className="recipes-list">
          <h1>Recipes</h1>
          {[...this.props.recipes.get('library').values()].reverse().map(recipe => (
              <h2
                  key={recipe.id}
                  onClick={() => this.handleSelect(recipe.id)}
              >
                {recipe.title}
              </h2>
          ))}
        </div>
    );
  }
}

export default RecipesList;