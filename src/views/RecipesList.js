import React from "react"
import PropTypes from "prop-types"
import Dispatcher from "../data/dispatcher"
import {
    Button,
    Card,
    List,
    Spin,
    Switch,
} from "antd"
import RecipeListItem from "./RecipeListItem"
import loadObjectOf from "../util/loadObjectOf"
import { Recipe } from "../data/RecipeTypes"
import AddToList from "./AddToList"
import RecipeActions from "../data/RecipeActions"
import LibraryActions from "../data/LibraryActions"
import ShoppingListItem from "./ShoppingListItem"
import SearchFilter from "./SearchFilter"
import {
    SCOPE_EVERYONE,
    SCOPE_MINE,
} from "../data/LibraryStore"

const updateFilter = (e) => {
    const {value: filter} = e.target
    Dispatcher.dispatch({
        type: LibraryActions.UPDATE_FILTER,
        filter
    })
}

const sendFilter = (e) => {
    if (e.key === 'Enter') {
        const {value: filter} = e.target
        Dispatcher.dispatch({
            type: LibraryActions.FILTER_LIBRARY,
            filter
        })
    }
}

const RecipesList = (props: {}) => {
    const {filter, scope, libraryLO, stagedRecipes, shoppingList} = props
    
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
            <div style={{float: "right"}}>
                <Switch checked={scope === SCOPE_EVERYONE}
                        checkedChildren="Everyone"
                        unCheckedChildren="Mine"
                        onChange={everyone => Dispatcher.dispatch({
                            type: LibraryActions.SET_SCOPE,
                            scope: everyone ? SCOPE_EVERYONE : SCOPE_MINE,
                        })}
                />
            </div>
            
            <h1>Recipe Library</h1>
    
            <SearchFilter
                onChange={updateFilter}
                onFilter={sendFilter}
                term={filter}
                />
            
            {stagedRecipes.length > 0 && <React.Fragment>
                <Card
                    title="Shopping List"
                    size="small"
                    style={{
                        float:"right",
                        maxWidth: "50%",
                        margin: "0 0 2em 2em",
                    }}>
                    {shoppingList.hasValue()
                        ? <List dataSource={shoppingList.getValueEnforcing()}
                                size="small"
                                split={false}
                                renderItem={ShoppingListItem}/>
                        : <Spin tip="Generating list..." />}
                </Card>
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
        </div>
    )
}

RecipesList.defaultProps = {
    filter: "",
    scope: "mine"
}

RecipesList.propTypes = {
    libraryLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired,
    stagedRecipes: PropTypes.arrayOf(Recipe).isRequired,
    filter: PropTypes.string,
    scope: PropTypes.string
}

export default RecipesList
