import React from 'react'
import { Link } from "react-router-dom"
import { List } from "antd"
import EditButton from "./common/EditButton"
import { Recipe } from "../data/RecipeTypes"
import history from "../util/history"

const {Item} = List

const RecipeListItem = ({recipe}) => {

    return (
        <Item
            key={recipe.id}
            onClick={event =>
                event.defaultPrevented || history.push(`/library/recipe/${recipe.id}`)}
            style={{cursor: "pointer"}}
            actions={[
                <Link key={recipe.id}
                      to={`/library/recipe/${recipe.id}/edit`}>
                    <EditButton />
                </Link>,
            ]}>
            <List.Item.Meta
                title={recipe.name}
            />
        </Item>
    )
}

RecipeListItem.propTypes = {
    recipe: Recipe
}

export default RecipeListItem