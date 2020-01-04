import React, { Component } from "react"
import RecipeForm from "../containers/RecipeForm"
import { Redirect } from "react-router-dom"
import { Spin } from "antd"
import Dispatcher from "../data/dispatcher"
import RecipeApi from "../data/RecipeApi"
import RecipeActions from "../data/RecipeActions"
import DeleteButton from "./common/DeleteButton"
import history from "../util/history"
import onNextActionThat from "../util/onNextActionThat"
import {handleSave as handleSaveCopy} from "./RecipeAdd"

const handleDelete = (id) => {
    RecipeApi.deleteRecipe(id)
}

const handleSave = recipe => {
    Dispatcher.dispatch({
        type: RecipeActions.UPDATE_RECIPE,
        data: recipe
    })
    onNextActionThat(action =>
        action.type === RecipeActions.RECIPE_UPDATED,
        (action) => {
            if (action.id !== recipe.id) return
            history.push(`/library/recipe/${recipe.id}`)
        })
}

const handleCancel = recipe => {
    Dispatcher.dispatch({
        type: RecipeActions.CANCEL_EDIT,
        id: recipe.id,
    })
    history.push(`/library/recipe/${recipe.id}`)
}

class RecipeEdit extends Component<{ recipeLO: any }> {
    render() {
        let {recipeLO} = this.props
        
        if (!recipeLO.hasValue()) {
            if (recipeLO.isLoading()) {
                return <Spin tip="Recipe is loading..."/>
            }
            return <Redirect to="/library"/>
        }
        
        return (
            <div>
                <h2>Editing {recipeLO.getValueEnforcing().name}</h2>
                <RecipeForm onSave={handleSave}
                            onSaveCopy={handleSaveCopy}
                            onCancel={handleCancel}/>
                <hr />
                <DeleteButton
                    type="recipe"
                    onConfirm={() => handleDelete(recipeLO.getValueEnforcing().id)}
                />

            </div>
        )
    }
}

export default RecipeEdit
