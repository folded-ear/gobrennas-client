import React, {Component} from 'react';
import {Form, Input, Button} from 'antd';
import Recipe from '../models/Recipe';
import RecipeApi from '../data/RecipeApi';
import PantryItemApi from '../data/PantryItemApi';
import IngredientAdd from "./IngredientAdd";

class RecipeAdd extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      title: '',
      external_url: '',
      ingredients: [],
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
    const {title, external_url, ingredients, directions } = this.state;
    
    const recipe = new Recipe({
      title,
      type: "Recipe",
      external_url,
      ingredients: ingredients.map( ingredient => {
        return {
          "quantity": ingredient.quantity,
          "ingredient": {
            "ingredientId": ingredient.ingredient,
            "type": "PantryItem"
          },
          "preparation": ingredient.preparation
        }
      }),
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
      return <p>{ingredient.quantity} {this.getIngredientName(ingredient.ingredient)} {ingredient.preparation}</p>
    })
  }
  
  render() {
    const {title, external_url, directions } = this.state;
    const {pantryItems} = this.props;
    const {TextArea} = Input;
    
    return (
      <div>
        <h2>Add New Recipe</h2>
        <div>
          <Form layout="vertical">
            <Form.Item>
              <Input
                name="title"
                placeholder="Recipe Title"
                value={title}
                onChange={this.handleUpdate}
              />
            </Form.Item>
            <Form.Item>
              <Input
                name="external_url"
                placeholder="External URL"
                value={external_url}
                onChange={this.handleUpdate}
              />
            </Form.Item>
            <IngredientAdd
              onSave={this.addIngredient}
              data={pantryItems}
            />
            { this.renderIngredients() }
            <Form.Item>
              <TextArea
                name="directions"
                placeholder="Recipe Directions"
                value={directions}
                onChange={this.handleUpdate}
                rows={4}
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