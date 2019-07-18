import React from 'react'
import PropTypes from "prop-types"
import Dispatcher from "../data/dispatcher"
import {
    Button,
    List,
    Spin,
} from "antd"
import RecipeListItem from "./RecipeListItem"
import loadObjectOf from "../util/loadObjectOf"
import { Recipe } from "../data/RecipeTypes"
import AddToList from "./AddToList"
import RecipeActions from "../data/RecipeActions"
import LibraryActions from "../data/LibraryActions"

const RecipesList = (props: {}) => {
    const {libraryLO, stagedRecipes} = props

    if (!libraryLO.hasValue()) {
        return <Spin tip="Loading recipe library..."/>
    }

    const stagedIds = new Set()
    for (const r of stagedRecipes) {
        stagedIds.add(r.id)
    }
    const library = libraryLO.getValueEnforcing()
        .filter(r => !stagedIds.has(r.id))
    return (
        <div className="recipes-list">
            <h1>Recipe Library</h1>
            {stagedRecipes.length > 0 && <React.Fragment>
                <h2>Staged</h2>
                <List
                    dataSource={stagedRecipes}
                    itemLayout="horizontal"
                    renderItem={recipe => <RecipeListItem recipe={recipe}
                                                          staged />}
                    footer={<Button.Group>
                        <Button
                            key="unstage-all"
                            shape="round"
                            size="small"
                            icon="delete"
                            onClick={() => Dispatcher.dispatch({
                                type: LibraryActions.UNSTAGE_ALL_RECIPES,
                            })}
                        >Unstage All</Button>
                        <AddToList
                            key="add-to-list"
                            onClick={listId => Dispatcher.dispatch({
                                type: RecipeActions.ASSEMBLE_SHOPPING_LIST,
                                recipeIds: [...stagedIds],
                                listId,
                            })}
                        />
                    </Button.Group>}
                />
                <h2>Everything Else</h2>
            </React.Fragment>}
            <List
                dataSource={library}
                itemLayout="horizontal"
                renderItem={recipe => <RecipeListItem recipe={recipe}/>}
            />

            {library.length === 0  && <em>No recipes yet...</em>}
        </div>
    )
}

RecipesList.propTypes = {
    libraryLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired,
    stagedRecipes: PropTypes.arrayOf(Recipe).isRequired,
}

export default RecipesList