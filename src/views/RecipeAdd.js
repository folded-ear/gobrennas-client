import React, { Component } from "react"
import RecipeForm from "../containers/RecipeForm"
import Dispatcher from "../data/dispatcher"
import RecipeActions from "../data/RecipeActions"

const handleSave = (recipe) => {
    Dispatcher.dispatch({
        type: RecipeActions.CREATE_RECIPE,
        data: recipe
    })
}

const handleCancel = () => Dispatcher.dispatch({
    type: RecipeActions.CANCEL_ADD,
})

class RecipeAdd extends Component<{}> {
    render() {
        return (
            <div>
                <h2>Add New Recipe</h2>
                <div>
                    <RecipeForm onSave={handleSave}
                                onCancel={handleCancel}/>
                </div>
            </div>
        )
    }
}

export default RecipeAdd