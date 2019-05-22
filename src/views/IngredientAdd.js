import React from 'react'
import {AutoComplete, Form, Input, Row, Col} from "antd";

const ingredientOptions = [
  'Milk',
  "Eggs",
  "Stuff"
];

const IngredientAdd = ({onSelect}) => {
  return (
    <Form.Item>
      <Row>
        <Col span={4}>
          <Input
            name="quantity"
            placeholder="Quantity"
            value={null}
          />
        </Col>
        <Col span={8}>
          <AutoComplete
          name="ingredient"
          dataSource={ingredientOptions}
          onSelect={onSelect}
          placeholder="Ingredients"
        />
        </Col>
        <Col span={12}>
          <Input
            name="preparation"
            placeholder="Preparation"
            value={null}
          />
        </Col>
      </Row>
    </Form.Item>
  )
};

export default IngredientAdd;