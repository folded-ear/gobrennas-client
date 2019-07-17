import React, { Component } from 'react'
import RecipeForm from "../containers/RecipeForm"
import Dispatcher from "../data/dispatcher"
import RecipeActions from "../data/RecipeActions"

const handleSave = (recipe) => {
    Dispatcher.dispatch({
        type: RecipeActions.CREATE_RECIPE,
        data: recipe
    })
}

class RecipeAdd extends Component<{}> {
    render() {
        return (
            <div>
                <h2>Add New Recipe</h2>
                <div>
                    <RecipeForm onSave={handleSave}/>
                </div>
            </div>
        )
    }
}

export default RecipeAdd