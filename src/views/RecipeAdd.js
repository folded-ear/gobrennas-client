import React, {Component} from 'react';
import {Form, Input, Button} from 'antd';
import Recipe from '../models/Recipe';
import Actions from '../data/actions';
import { AutoComplete } from 'antd';
import IngredientAdd from "./IngredientAdd";

const {TextArea} = Input;

class RecipeAdd extends Component {
  
  constructor(props) {
    super(props);
    
    // TODO: need to fetch a list of ingredients for the autocomplete -- either that or create a service
    this.state = {
      title: '',
      external_url: '',
      ingredients: [],
      directions: ''
    };
  }
  
  handleSelect = (value) => {
    const { ingredients } = this.state;
    this.setState({ ingredients: [...ingredients, value]})
  };
  
  handleUpdate = (e) => {
    const { name, value } = e.target;
    this.setState({ [name] : value})
  };
  
  handleSave = () => {
    const {title, external_url, ingredients, directions } = this.state;
    
    const recipe = new Recipe({
      title,
      type: "Recipe",
      external_url,
      ingredients: [],
      directions
    });
    Actions.addRecipe(recipe);
    this.props.history.push('/');
  };
  
  render() {
    const {title, external_url, ingredients, directions } = this.state;
    const pantryitems = this.props.recipes.get('pantry_items');
    
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
            <IngredientAdd onSelect={this.handleSelect} data={pantryitems}/>
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