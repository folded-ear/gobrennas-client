import React from 'react'
import { Container } from "flux/utils"
import Dispatcher from "../data/dispatcher"
import {
    Link,
    Redirect,
} from "react-router-dom"
import {
    Button,
    Icon,
    List,
    Spin,
} from "antd"
import TaskStore from "../data/TaskStore"
import RecipeActions from "../data/RecipeActions"
import RecipeStore from "../data/RecipeStore"
import Directions from "./common/Directions"
import IngredientParseUI from "./IngredientParseUI"
import loadObjectOf from "../util/loadObjectOf"
import { Recipe } from "../data/RecipeTypes"

const handleAddToList = (recipeId, listId) => Dispatcher.dispatch({
    type: RecipeActions.ASSEMBLE_SHOPPING_LIST,
    recipeId,
    listId,
})

const RecipeDetail = ({recipeLO}) => {

    if (!recipeLO.hasValue()) {
        if (recipeLO.isLoading()) {
            return <Spin tip="Recipe is loading..."/>
        }
        return <Redirect to="/library" />
    }
    
    const recipe = recipeLO.getValueEnforcing()

    return (
        <div>
            <Link to="/library">X Close</Link>
            <h3>{recipe.name}</h3>

            {recipe.externalUrl && <React.Fragment>
                <h5>Source</h5>
                <p><a href={recipe.externalUrl}>{recipe.externalUrl}</a></p>
            </React.Fragment>}

            {recipe.ingredients != null && recipe.ingredients.length > 0 && <React.Fragment>
                <h5>Ingredients</h5>
                <List
                    dataSource={recipe.ingredients}
                    renderItem={(it, offset) => <List.Item>
                        <IngredientParseUI
                            ingredient={it}
                            recipeId={recipe.id}
                            offset={offset}
                        />
                    </List.Item>}
                    size="small"
                    split
                    footer={<AddToList onClick={listId => handleAddToList(recipe.id, listId)} />}
                />
            </React.Fragment>}

            <h5>Preparation</h5>
            <Directions text={recipe.directions} />

        </div>
    )
}

const AddToList = Container.createFunctional(
    ({
         listLO,
         onClick,
         isSending,
     }) => {
        if (! listLO.hasValue()) return null
        const list = listLO.getValueEnforcing()
        return <Button
            shape="round"
            size="small"
            onClick={() => onClick(list.id)}
            disabled={isSending}
            >
                Add to &quot;{list.name}&quot;
                <Icon type={isSending ? "loading" : "arrow-right"} />
            </Button>
    },
    () => [
        TaskStore,
        RecipeStore,
    ],
    (prevState, props) => {
        const sendState = RecipeStore.getSendState()
        return {
            onClick: props.onClick,
            listLO: TaskStore.getActiveListLO(),
            isSending: sendState != null && !sendState.isDone(),
        }
    },
    {withProps: true},
)

RecipeDetail.propTypes = {
    recipeLO: loadObjectOf(Recipe)
}

export default RecipeDetail