import React from "react"
import PropTypes from "prop-types"
import Dispatcher from "../data/dispatcher"
import {
    Button,
    Card,
    List,
    Spin,
} from "antd"
import RecipeListItem from "./RecipeListItem"
import loadObjectOf from "../util/loadObjectOf"
import { Recipe } from "../data/RecipeTypes"
import AddToList from "./AddToList"
import RecipeActions from "../data/RecipeActions"
import LibraryActions from "../data/LibraryActions"
import Quantity from "./common/Quantity"

const ShoppingListItem = it =>
    typeof it === "string"
        ? <List.Item>&quot;{it}&quot;</List.Item>
        : <List.Item>
            {it.ingredient.name} ({it.quantities.map((q, i, a) =>
            <span key={q.units}>
                {i > 0 && ", "}
                {i > 0 && i === a.length - 1 && " and"}
                <Quantity
                    quantity={q.quantity}
                    units={q.units}/>
        </span>,
        )})
        </List.Item>

const RecipesList = (props: {}) => {
    const {libraryLO, stagedRecipes, shoppingList} = props

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

RecipesList.propTypes = {
    libraryLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired,
    stagedRecipes: PropTypes.arrayOf(Recipe).isRequired,
}

export default RecipesList