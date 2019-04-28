import React from 'react';
import {Form, Input, Button} from 'antd/lib/index';

const {TextArea} = Input;

const RecipeAdd = () => (
  <div>
    <h2>Add New Recipe</h2>
    <div>
      <Form layout="vertical">
        <Form.Item>
          <Input placeholder="Recipe Title"/>
        </Form.Item>
        <Form.Item>
          <Input placeholder="External URL"/>
        </Form.Item>
        <Form.Item>
          <TextArea placeholder="Recipe Ingredients" rows={4}/>
        </Form.Item>
        <Form.Item>
          <TextArea placeholder="Recipe Directions" rows={4}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary">Save</Button>
        </Form.Item>
      </Form>
    </div>
  </div>
);

export default RecipeAdd;