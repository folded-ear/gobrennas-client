import React, { Component } from 'react'
import RecipeForm from '../containers/RecipeForm'
import { Redirect } from 'react-router-dom'
import { Spin } from 'antd'
import Dispatcher from "../data/dispatcher"
import RecipeApi from "../data/RecipeApi"
import RecipeActions from "../data/RecipeActions"
import DeleteButton from "./common/DeleteButton"

const handleDelete = (id) => {
    RecipeApi.deleteRecipe(id)
}

const handleSave = (recipe) => {
    Dispatcher.dispatch({
        type: RecipeActions.UPDATE_RECIPE,
        data: recipe
    })
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
                <RecipeForm onSave={handleSave}/>
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