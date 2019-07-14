import React from 'react'
import RecipeForm from "../containers/RecipeForm"
import Dispatcher from "../data/dispatcher"
import RecipeActions from "../data/RecipeActions"

const handleSave = (recipe) => {
    Dispatcher.dispatch({
        type: RecipeActions.CREATE_RECIPE,
        data: recipe
    })
}

const RecipeAdd = () => {
    return (
        <div>
            <h2>Add New Recipe</h2>
            <div>
                <RecipeForm onSave={handleSave}/>
            </div>
        </div>
    )
}

export default RecipeAdd