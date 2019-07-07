import React, { Component } from 'react';
import {
    Button,
    Form,
    Input,
} from 'antd';
import Recipe from '../models/Recipe';
import RecipeApi from '../data/RecipeApi';

class RecipeAdd extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      name: '',
      externalUrl: '',
      rawIngredients: '',
      directions: ''
    };
  }
  
  componentDidMount() {
    PantryItemApi.fetchPantryItems()
  }
  
  handleUpdate = (e) => {
    const { name, value } = e.target;
    this.setState({ [name] : value})
  };
  
  addIngredient = (ingredient) => {
    const { ingredients } = this.state;
    this.setState({ ingredients: [...ingredients, ingredient]})
  };
  
  handleSave = () => {
      const {name, externalUrl, rawIngredients, directions} = this.state;
    
    const recipe = new Recipe({
      name,
      type: "Recipe",
      displayTitle: name,
      externalUrl,
        ingredients: rawIngredients
            .split("\n")
            .map(it => it.trim())
            .filter(it => it.length > 0)
            // since this a Recipe, these should be IngredientRef, but
            // `RecipeApi.addRecipe` assume they aren't.
            .map(raw => ({raw})),
      directions
    });
    RecipeApi.addRecipe(recipe);
  };
  
  getIngredientName(id) {
    const {pantryItems} = this.props;
    const item = pantryItems.find( item => item.get('id') === parseInt(id));
    if(item) {
      return item.name;
    }
  }
  
  renderIngredients() {
    const { ingredients } = this.state;
    
    return ingredients.map( ingredient => {
      return <p key={ingredient.selectedIngredient}>{ingredient.quantity} {this.getIngredientName(ingredient.selectedIngredient)} {ingredient.preparation}</p>
    })
  }
  
  render() {
    const {name, externalUrl, rawIngredients, directions } = this.state;
    const {TextArea} = Input;
    
    return (
      <div>
        <h2>Add New Recipe</h2>
        <div>
          <Form layout="vertical">
            <Form.Item>
              <Input
                name="name"
                placeholder="Recipe Title"
                value={name}
                onChange={this.handleUpdate}
              />
            </Form.Item>
            <Form.Item>
              <Input
                name="externalUrl"
                placeholder="External URL"
                value={externalUrl}
                onChange={this.handleUpdate}
              />
            </Form.Item>
            <Form.Item>
              <TextArea
                  name="rawIngredients"
                  placeholder="Add Ingredients List"
                  value={rawIngredients}
                  onChange={this.handleUpdate}
                  rows={10}
              />
            </Form.Item>
            <Form.Item>
              <TextArea
                name="directions"
                placeholder="Recipe Directions"
                value={directions}
                onChange={this.handleUpdate}
                rows={10}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={this.handleSave}>Save</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default RecipeAdd;