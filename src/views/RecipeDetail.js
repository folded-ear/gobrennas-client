import React from 'react'
import Dispatcher from "../data/dispatcher"
import { Redirect } from "react-router-dom"
import {
    Affix,
    Button,
    List,
    Spin,
} from "antd"
import RecipeActions from "../data/RecipeActions"
import Directions from "./common/Directions"
import IngredientParseUI from "./IngredientParseUI"
import loadObjectOf from "../util/loadObjectOf"
import AddToList from "./AddToList"
import { Recipe } from "../data/RecipeTypes"
import history from "../util/history"

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
            <Button.Group>
                <Button
                    icon="close"
                    onClick={() => history.push("/library")}
                >Close</Button>
                <Button
                    icon="edit"
                    onClick={() => history.push(`/library/recipe/${recipe.id}/edit`)}
                >Edit</Button>
            </Button.Group>

            <Affix offsetTop={0}>
                <h2 style={{
                    backgroundColor: "white",
                }}>{recipe.name}</h2>
            </Affix>

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
                    footer={<AddToList onClick={listId => Dispatcher.dispatch({
                        type: RecipeActions.ASSEMBLE_SHOPPING_LIST,
                        recipeIds: [recipe.id],
                        listId,
                    })} />}
                />
            </React.Fragment>}

            <h5>Preparation</h5>
            <Directions text={recipe.directions} />

        </div>
    )
}

RecipeDetail.propTypes = {
    recipeLO: loadObjectOf(Recipe)
}

export default RecipeDetail