import React, {Component} from 'react'
import {AutoComplete, Form, Input, Row, Col} from "antd";
import * as PropTypes from "prop-types";

class IngredientAdd extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      quantity: '',
      preparation: ''
    }
  }
  
  handleUpdate = (e) => {
    const {name, value} = e.target;
    this.setState({[name]: value})
  };
  
  render() {
    // const pantryitems = props.recipes.get('pantry_items').map( item => item.name);
    
    // TODO: Add new ingredient from here if you don't see it in the dropdown -- need UX thoughts on this
    // TODO: Send ingredient to the parent component?
    const {onSelect} = this.props;
    const {quantity, preparation} = this.state;
    
    const pantryitems = [
      'Milk',
      "Eggs",
      "Stuff"
    ];
    
    return (
      <Form.Item>
        <Row>
          <Col span={4}>
            <Input
              name="quantity"
              placeholder="Quantity"
              onChange={this.handleUpdate}
              value={quantity}
            />
          </Col>
          <Col span={8}>
            <AutoComplete
              name="ingredient"
              dataSource={pantryitems}
              onSelect={onSelect}
              placeholder="Ingredients"
            />
          </Col>
          <Col span={12}>
            <Input
              name="preparation"
              placeholder="Preparation"
              onChange={this.handleUpdate}
              value={preparation}
            />
          </Col>
        </Row>
      </Form.Item>
    )
  }
}

IngredientAdd.propTypes = {onSelect: PropTypes.func};

export default IngredientAdd;