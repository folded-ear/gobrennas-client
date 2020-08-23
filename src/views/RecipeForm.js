import {
    Button,
    Form,
    Input,
    List,
    Spin,
} from "antd";
import ChipInput from "material-ui-chip-input";
import PropTypes from "prop-types";
import React from 'react';
import Dispatcher from '../data/dispatcher';
import RecipeActions from "../data/RecipeActions";
import { Recipe } from "../data/RecipeTypes";
import ElEdit from "./ElEdit";

const handleUpdate = (e) => {
    const { name: key, value } = e.target;
    Dispatcher.dispatch({
        type: RecipeActions.DRAFT_RECIPE_UPDATED,
        data: { key, value}
    });
};

const addLabel = (label) => {
    Dispatcher.dispatch({
        type: RecipeActions.NEW_DRAFT_LABEL,
        data: label
    });
};

const removeLabel = (label, index) => {
    Dispatcher.dispatch({
        type: RecipeActions.REMOVE_DRAFT_LABEL,
        data: {label, index}
    });
};

const NewIngredient = <Button
    icon="plus"
    onClick={() => Dispatcher.dispatch({
        type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
    })}
>
    New Ingredient
</Button>;

const RecipeForm = ({draft: lo, onSave, onSaveCopy, onCancel}) => {

    const {TextArea} = Input;
    const draft = lo.getValueEnforcing();
    const hasIngredients = draft.ingredients && draft.ingredients.length > 0;
    
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
                    renderItem={(it, i) => <List.Item>
                        <ElEdit
                            name={`ingredients.${i}`}
                            value={it}
                            onChange={handleUpdate}
                            onMultilinePaste={text => Dispatcher.dispatch({
                                type: RecipeActions.MULTI_LINE_DRAFT_INGREDIENT_PASTE_YO,
                                index: i,
                                text,
                            })}
                            onPressEnter={() => Dispatcher.dispatch({
                                type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
                                index: i,
                            })}
                            onDelete={() => Dispatcher.dispatch({
                                type: RecipeActions.KILL_DRAFT_INGREDIENT_YO,
                                index: i,
                            })}
                        />
                        <div style={{marginLeft: "auto"}}>
                            <Button
                                key="add"
                                icon="plus"
                                tabIndex={-1}
                                onClick={() => Dispatcher.dispatch({
                                    type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
                                    index: i,
                                })}
                            />
                            <Button
                                key="delete"
                                icon="delete"
                                tabIndex={-1}
                                onClick={() => Dispatcher.dispatch({
                                    type: RecipeActions.KILL_DRAFT_INGREDIENT_YO,
                                    index: i,
                                })}
                            />
                        </div>
                    </List.Item>}
                    split={false}
                    size="small"
                    header={hasIngredients || NewIngredient}
                    footer={hasIngredients && NewIngredient}
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
                <ChipInput
                    name="labels"
                    value={draft.labels}
                    onAdd={addLabel}
                    onDelete={removeLabel}
                    fullWidth
                    label='Labels'
                    placeholder='Type and press enter to add labels'
                />
            </Form.Item>
            <Form.Item>
                <Button.Group>
                    <Button
                        type="primary"
                        onClick={() => onSave(draft)}>Save</Button>
                    {onSaveCopy && <Button
                        onClick={() => onSaveCopy(draft)}>Save as Copy</Button>}
                    <Button
                        onClick={() => onCancel(draft)}>Cancel</Button>
                </Button.Group>
            </Form.Item>
        </Form>
    );

    return lo.isDone()
        ? form
        : <Spin>{form}</Spin>;
};

RecipeForm.propTypes = {
    onSave: PropTypes.func,
    onSaveCopy: PropTypes.func,
    onCancel: PropTypes.func,
    draft: Recipe
};

export default RecipeForm;
