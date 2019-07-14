import React from 'react'
import PropTypes from "prop-types"
import Dispatcher from '../data/dispatcher'
import {
    Button,
    Form,
    Input,
} from "antd"
import RecipeActions from "../data/RecipeActions"
import { Recipe } from "../data/RecipeTypes"


const handleUpdate = (e) => {
    const { name: key, value } = e.target
    Dispatcher.dispatch({
        type: RecipeActions.DRAFT_RECIPE_UPDATED,
        data: { key, value}
    })
}

const RecipeForm = ({draft, onSave}) => {
    
    const {TextArea} = Input
    
    return (
        <Form layout="vertical">
            <Form.Item>
                <Input
                    name="name"
                    placeholder="Recipe Title"
                    value={draft.name}
                    onChange={handleUpdate}
                />
            </Form.Item>
            <Form.Item>
                <Input
                    name="externalUrl"
                    placeholder="External URL"
                    value={draft.externalUrl}
                    onChange={handleUpdate}
                />
            </Form.Item>
            <Form.Item>
                <TextArea
                    name="rawIngredients"
                    placeholder="Add Ingredients List"
                    value={draft.rawIngredients}
                    onChange={handleUpdate}
                    rows={10}
                />
            </Form.Item>
            <Form.Item>
                <TextArea
                    name="directions"
                    placeholder="Recipe Directions"
                    value={draft.directions}
                    onChange={handleUpdate}
                    rows={10}
                />
            </Form.Item>
            <Form.Item>
                <Button
                    type="primary"
                    onClick={() => onSave(draft)}>Save</Button>
            </Form.Item>
        </Form>

    )
}

RecipeForm.propTypes = {
    onSave: PropTypes.func,
    draft: Recipe
}

export default RecipeForm