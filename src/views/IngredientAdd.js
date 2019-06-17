import React, { Component} from 'react'
import {AutoComplete, Button, Col, Form, Input, Row} from "antd";
import * as PropTypes from "prop-types";

class IngredientAdd extends Component<{ onSelect: PropTypes.func }> {
  
  constructor(props) {
    super(props);
    this.state = {
      quantity: '',
      preparation: '',
      value: '',
      selectedIngredient: '',
      items: []
    }
  }
  
  reset = () => {
    this.setState({
      quantity: '',
      preparation: '',
      selectedIngredient: '',
      value: ''
    })
  };
  
  componentDidUpdate(prev): void {
    if(prev.data !== this.props.data) {
      this.setState({ items: this.props.data })
    }
  }
  
  handleChange = (e) => {
    const {name, value} = e.target;
    this.setState({ [name]: value })
  };
  
  handleSelect = (selectedIngredient) => {
    this.setState({ selectedIngredient })
  };
  
  handleSearch = value => {
    const { data: items } = this.props;
    this.setState({ items: items.filter( item => item.name.includes(value)), value });
  };
  
  handleSave = () => {
    const {onSave} = this.props;
    const { quantity, preparation, selectedIngredient } = this.state;
    onSave({quantity, preparation, selectedIngredient});
    this.reset();
  };
  
  render() {
    const { quantity, preparation, items, value } = this.state;
    const Option = AutoComplete.Option;
    const pantryItems = items.map(item => <Option key={item.id}>{item.name}</Option>);
    
    return (
        <Row>
          <Col span={4}>
            <Form.Item>
              <Input
                  name="quantity"
                  placeholder="Quantity"
                  onChange={this.handleChange}
                  value={quantity}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item>
              <AutoComplete
                  name="ingredient"
                  onSelect={this.handleSelect}
                  onSearch={this.handleSearch}
                  placeholder="Ingredients"
                  value={value}
              >
                {pantryItems}
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item>
              <Input
                  name="preparation"
                  placeholder="Preparation"
                  onChange={this.handleChange}
                  value={preparation}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item>
              <Button
                  type="primary"
                  onClick={this.handleSave}>Add</Button>
            </Form.Item>
          </Col>
        </Row>
    )
  }
}

IngredientAdd.propTypes = {onSelect: PropTypes.func};

export default IngredientAdd;