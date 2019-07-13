import React from 'react'
import { Link } from "react-router-dom"
import {
    Button,
    List
} from "antd"

const RecipeListItem = ({recipe}) => {
    
    const {Item} = List
    
    return (
        <Item actions={[
            <Link to={`/library/recipe/${recipe.ingredientId}/edit`}>
                <Button type="primary" shape="circle"
                    icon="edit"
                    size="small"/>
        </Link>]}>
            <List.Item.Meta
                title={<Link to={`/library/recipe/${recipe.ingredientId}`}>{recipe.name}</Link>}
            />
        </Item>
    )
}

export default RecipeListItem;