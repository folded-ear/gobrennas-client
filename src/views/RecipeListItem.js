import React from 'react'
import { Link } from "react-router-dom"
import { List } from "antd"
import EditButton from "./common/EditButton"

const RecipeListItem = ({recipe}) => {
    
    const {Item} = List
    
    return (
        <Item
            key={recipe.id}
            actions={[
                <Link key={recipe.id} to={`/library/recipe/${recipe.id}/edit`}><EditButton /></Link>]
            }>
            <List.Item.Meta
                title={<Link to={`/library/recipe/${recipe.id}`}>{recipe.name}</Link>}
            />
        </Item>
    )
}

export default RecipeListItem