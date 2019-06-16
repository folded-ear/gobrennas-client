import React, { Component } from 'react'
import {
    Button,
    Form,
    Input,
} from "antd";
import PantryItem from "../models/PantryItem";
import PantryItemApi from "../data/PantryItemApi";

class PantryItemAdd extends Component {
  constructor(props) {
   super(props);
   this.state = {
     name: '',
     aisle: ''
   }
  }
  
  handleSave = () => {
    const { name, aisle } = this.state;
  
    const item = new PantryItem({
      type: "PantryItem",
      name,
      aisle
    });
  
    PantryItemApi.addPantryItem(item);
  };
  
  handleUpdate = (e) => {
    const { name, value } = e.target;
    this.setState({ [name] : value})
  };
  
  
  render() {
    const { name, aisle } = this.state;
    
    return (
      <div>
        <Form>
          <Form.Item>
            <Input
              name="name"
              placeholder="Name of Item"
              value={name}
              onChange={this.handleUpdate}
            />
          </Form.Item>
          <Form.Item>
            <Input
              name="aisle"
              placeholder="Aisle"
              value={aisle}
              onChange={this.handleUpdate}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={this.handleSave}>Save</Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default PantryItemAdd;