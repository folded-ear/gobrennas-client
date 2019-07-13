import React from 'react'
import { Link } from "react-router-dom"
import { List } from "antd"
import EditButton from "./common/EditButton"

const RecipeListItem = ({recipe}) => {
    
    const {Item} = List
    
    return (
        <Item
            key={recipe.ingredientId}
            actions={[
                <Link key={recipe.ingredientId} to={`/library/recipe/${recipe.ingredientId}/edit`}><EditButton /></Link>]
            }>
            <List.Item.Meta
                title={<Link to={`/library/recipe/${recipe.ingredientId}`}>{recipe.name}</Link>}
            />
        </Item>
    )
}

export default RecipeListItem