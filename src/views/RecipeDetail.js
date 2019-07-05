import React from 'react';
import { Container } from "flux/utils";
import Dispatcher from "../data/dispatcher";
import { Link } from "react-router-dom";
import {
    Button,
    Icon,
    List,
    Spin,
} from "antd";
import IngredientItem from "./IngredientItem";
import RecipeApi from "../data/RecipeApi";
import TaskStore from "../data/TaskStore";
import RecipeActions from "../data/RecipeActions";

const handleDelete = (id) => {
    RecipeApi.deleteRecipe(id);
};

const handleAddToList = (recipeId, listId) => Dispatcher.dispatch({
    type: RecipeActions.SEND_RAW_INGREDIENTS_TO_TASK_LIST,
    recipeId,
    listId,
});

const RecipeDetail = ({recipeLO}) => {
    
    if (!recipeLO.hasValue()) {
        return <Spin tip="Recipe is loading..."/>
    }
    
    const recipe = recipeLO.getValueEnforcing();

    return (
        <div>
            <Link to="/library">X Close</Link>
            <h3>{recipe.title}</h3>
            <h5>Source</h5>
            <p>{recipe.external_url}</p>
            
            <h5>Ingredients</h5>
            <div>{recipe.ingredients.map(ingredient => {
                return (
                    <IngredientItem key={ingredient.id} ingredient={ingredient}/>
                )
            })}</div>

            {recipe.rawIngredients && <React.Fragment>
                <h5>Raw Ingredients</h5>
                <List
                    dataSource={recipe.rawIngredients
                        .split("\n")}
                    renderItem={it => <List.Item>{it}</List.Item>}
                    size="small"
                    footer={<AddToList onClick={listId => handleAddToList(recipe.ingredientId, listId)} />}
                />
            </React.Fragment>}
            
            <h5>Preparation</h5>
            <p>{recipe.directions}</p>
            
            <Button type="danger" onClick={() => handleDelete(recipe.ingredientId)}>Delete Recipe</Button>
        </div>
    )
};

const AddToList = Container.createFunctional(
    ({
         listLO,
         onClick,
     }) => {
        if (! listLO.hasValue()) return null;
        const list = listLO.getValueEnforcing();
        return <Button
                shape="round"
                size="small"
                onClick={() => onClick(list.id)}
            >
                Add to "{list.name}"
                <Icon type="arrow-right" />
            </Button>;
    },
    () => [
        TaskStore,
    ],
    (prevState, props) => {
        return {
            onClick: props.onClick,
            listLO: TaskStore.getActiveListLO(),
        };
    },
    {withProps: true},
);

export default RecipeDetail;