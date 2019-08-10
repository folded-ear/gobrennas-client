import React from 'react'
import PropTypes from "prop-types"
import Dispatcher from '../data/dispatcher'
import {
    Button,
    Form,
    Input,
    List,
    Spin,
} from "antd"
import RecipeActions from "../data/RecipeActions"
import { Recipe } from "../data/RecipeTypes"
import ElEdit from "./ElEdit"


const handleUpdate = (e) => {
    const { name: key, value } = e.target
    Dispatcher.dispatch({
        type: RecipeActions.DRAFT_RECIPE_UPDATED,
        data: { key, value}
    })
}

const RecipeForm = ({draft: lo, onSave, onCancel}) => {

    const {TextArea} = Input
    const draft = lo.getValueEnforcing()

    const form = (
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
                <List
                    dataSource={draft.ingredients}
                    renderItem={(it, i) =>
                        <ElEdit
                            name={`ingredients.${i}`}
                            value={it}
                            onChange={handleUpdate}
                        />}
                    footer={<Button
                        icon="plus"
                        onClick={() => Dispatcher.dispatch({
                            type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
                        })}
                    >
                        New
                    </Button>}
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
                <Button.Group>
                    <Button
                        type="primary"
                        onClick={() => onSave(draft)}>Save</Button>
                    <Button
                        onClick={() => onCancel(draft)}>Cancel</Button>
                </Button.Group>
            </Form.Item>
        </Form>
    )

    return lo.isDone()
        ? form
        : <Spin>{form}</Spin>
}

RecipeForm.propTypes = {
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    draft: Recipe
}

export default RecipeForm