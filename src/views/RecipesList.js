import React from 'react'
import { Spin } from "antd"
import RecipeListItem from "./RecipeListItem"

const RecipesList = (props: {}) => {
    const {libraryLO} = props
    
    if (!libraryLO.hasValue()) {
        return <Spin tip="Loading recipe library..."/>
    }
    
    const library = libraryLO.getValueEnforcing()
    return (
        <div className="recipes-list">
            <h1>Recipe Library</h1>
            {[...library].reverse().map(recipe => <RecipeListItem key={recipe.ingredientId} recipe={recipe} />)}
            {library.length === 0  && <em>No recipes yet...</em>}
        </div>
    )
}

export default RecipesList