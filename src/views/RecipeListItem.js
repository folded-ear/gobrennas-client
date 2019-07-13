import React from 'react'
import { Link } from "react-router-dom"
import { Button } from "antd"

const RecipeListItem = ({recipe}) => {
    return (
        <React.Fragment>
            <h2 key={recipe.ingredientId}>
                <Link to={`/library/recipe/${recipe.ingredientId}`}>{recipe.name}</Link>
            </h2>
            <Link to={`/library/recipe/${recipe.ingredientId}/edit`}><Button type="primary" shape="circle" icon="edit" size="small" /></Link>
        </React.Fragment>
    )
}

export default RecipeListItem;