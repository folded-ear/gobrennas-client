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
    
    // TODO: This lifecycle method is temporary! The correct option is to make any store aware of router state
    componentDidMount(): void {
        setTimeout(() => {
            Dispatcher.dispatch({
                type: RecipeActions.LOAD_EMPTY_RECIPE
            })
        })
    }
    
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