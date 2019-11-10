import React from "react"
import PropTypes from "prop-types"
import Dispatcher from "../data/dispatcher"
import {
    Button,
    Card,
    Col,
    List,
    Row,
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
    isRecipeStaged,
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
    const {me, filter, scope, libraryLO, shoppingList} = props
    
    if (!libraryLO.hasValue()) {
        return <Spin tip="Loading recipe library..."/>
    }

    const [library, stagedRecipes] = scope === SCOPE_MINE
        ? libraryLO.getValueEnforcing()
            .reduce((part, r) => {
                part[isRecipeStaged(r) ? 1 : 0].push(r)
                return part
            }, [[], []])
        : [libraryLO.getValueEnforcing(), []]
    const hasStage = stagedRecipes.length > 0

    const list = hasStage && <Card
        title="Shopping List"
        size="small"
        style={{
            marginLeft: "1em",
        }}>
        {shoppingList.hasValue()
            ? <List dataSource={shoppingList.getValueEnforcing()}
                    size="small"
                    split={false}
                    renderItem={ShoppingListItem} />
            : <Spin tip="Generating list..." />}
    </Card>

    const stage = hasStage && <List
        dataSource={stagedRecipes}
        itemLayout="horizontal"
        renderItem={recipe =>
            <RecipeListItem recipe={recipe}
                            mine={recipe.ownerId === me.id}
                            staged />}
        footer={<Button.Group>
            <AddToList
                key="add-to-list"
                onClick={listId => Dispatcher.dispatch({
                    type: RecipeActions.ASSEMBLE_SHOPPING_LIST,
                    recipeIds: stagedRecipes.map(r => r.id),
                    listId,
                })}
            />
        </Button.Group>}
    />

    const content = <React.Fragment>
        <SearchFilter
            onChange={updateFilter}
            onFilter={sendFilter}
            term={filter}
        />

        <List
            dataSource={library}
            itemLayout="horizontal"
            renderItem={recipe =>
                <RecipeListItem recipe={recipe}
                                mine={recipe.ownerId === me.id} />}
        />
    </React.Fragment>

    return <React.Fragment>
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
        <Row>
            <Col span={hasStage ? 18 : 24}>
                {hasStage && <React.Fragment>
                    <h2>Staged</h2>
                    {stage}
                    <h2>Everything Else</h2>
                </React.Fragment>}
                {content}
            </Col>
            {hasStage && <Col span={6}>{list}</Col>}
        </Row>
    </React.Fragment>
}

RecipesList.defaultProps = {
    filter: "",
    scope: "mine"
}

RecipesList.propTypes = {
    me: PropTypes.object.isRequired,
    libraryLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired,
    filter: PropTypes.string,
    scope: PropTypes.string,
    shoppingList: loadObjectOf(PropTypes.array),
}

export default RecipesList
