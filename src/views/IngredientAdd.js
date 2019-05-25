import React, { useState } from 'react'
import {AutoComplete, Button, Col, Form, Input, Row} from "antd";
import * as PropTypes from "prop-types";

function IngredientAdd(props) {
  
  const [quantity, setQuantity] = useState('');
  const [preparation, setPreparation] = useState('');
  const [ingredient, setIngredient] = useState('');
  
  const handleQuantity = (e) => {
    const { value } = e.target;
    setQuantity(value)
  };
  
  const handlePreparation = (e) => {
    const { value } = e.target;
    setPreparation(value)
  };
  
  const handleSave = () => {
    const { onSave } = props;
    onSave({quantity, preparation, ingredient});
    setQuantity('');
    setPreparation('');
    setIngredient('');
  };
  
  const Option = AutoComplete.Option;
  const pantryitems = props.data.map(item => <Option key={item.id}>{item.name}</Option>);
  
  
  return (
    <Row>
      <Col span={4}>
        <Form.Item>
          <Input
            name="quantity"
            placeholder="Quantity"
            onChange={handleQuantity}
            value={quantity}
          />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item>
          <AutoComplete
            name="ingredient"
            dataSource={pantryitems}
            onSelect={setIngredient}
            value={ingredient}
            placeholder="Ingredients"
          >
            {pantryitems}
          </AutoComplete>
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item>
          <Input
            name="preparation"
            placeholder="Preparation"
            onChange={handlePreparation}
            value={preparation}
          />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleSave}>Add</Button>
        </Form.Item>
      </Col>
    </Row>
  )
}

IngredientAdd.propTypes = {onSelect: PropTypes.func};

export default IngredientAdd;