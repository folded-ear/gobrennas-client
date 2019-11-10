import React from 'react'
import PropTypes from "prop-types"
import Dispatcher from "../data/dispatcher"
import { Link } from "react-router-dom"
import {
    Button,
    List,
} from "antd"
import EditButton from "./common/EditButton"
import { Recipe } from "../data/RecipeTypes"
import history from "../util/history"
import LibraryActions from "../data/LibraryActions"
import { LABEL_STAGED_INDICATOR } from "../data/LibraryStore"

const {Item} = List

const RecipeListItem = ({recipe, staged}) => {
    const labelString = (recipe.labels || [])
        .filter(l =>
            l !== LABEL_STAGED_INDICATOR)
        .sort()
        .join(", ")
    return (
        <Item
            key={recipe.id}
            onClick={event =>
                event.defaultPrevented || history.push(`/library/recipe/${recipe.id}`)}
            style={{cursor: "pointer"}}
            actions={[
                staged
                    ? <Button key="unstage"
                              shape="circle"
                              icon="delete"
                              size="small"
                              title="Unstage recipe"
                              onClick={e => {
                                  e.preventDefault()
                                  Dispatcher.dispatch({
                                      type: LibraryActions.UNSTAGE_RECIPE,
                                      id: recipe.id,
                                  })
                              }}
                    />
                    : <Button key="stage"
                              shape="circle"
                              icon="select"
                              size="small"
                              title="Stage recipe"
                              onClick={e => {
                                  e.preventDefault()
                                  Dispatcher.dispatch({
                                      type: LibraryActions.STAGE_RECIPE,
                                      id: recipe.id,
                                  })
                              }}
                    />,
                <Link key="edit"
                      to={`/library/recipe/${recipe.id}/edit`}><EditButton /></Link>,
            ]}>
            <List.Item.Meta
                title={recipe.name}
                description={labelString}
            />
        </Item>
    )
}

RecipeListItem.propTypes = {
    recipe: Recipe,
    staged: PropTypes.bool,
}

export default RecipeListItem