import {
    Button,
    Card,
    Col,
    List,
    Row,
    Spin,
    Switch,
} from "antd";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import LibraryActions from "../data/LibraryActions";
import {
    SCOPE_EVERYONE,
    SCOPE_MINE,
} from "../data/LibraryStore";
import RecipeActions from "../data/RecipeActions";
import { Recipe } from "../data/RecipeTypes";
import loadObjectOf from "../util/loadObjectOf";
import AddToList from "./AddToList";
import RecipeListItem from "./RecipeListItem";
import SearchFilter from "./SearchFilter";
import ShoppingListItem from "./ShoppingListItem";

const updateFilter = (e) => {
    const {value: filter} = e.target;
    Dispatcher.dispatch({
        type: LibraryActions.UPDATE_FILTER,
        filter
    });
};

const sendFilter = (e) => {
    if (e.key === "Enter") {
        const {value: filter} = e.target;
        Dispatcher.dispatch({
            type: LibraryActions.FILTER_LIBRARY,
            filter
        });
    }
};

const RecipesList = (props: {}) => {
    const {me, filter, scope, libraryLO, stagedRecipes, shoppingList} = props;
    const hasStage = stagedRecipes.length > 0;
    const stagedIds = new Set(stagedRecipes.map(r => r.id));

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
    </Card>;

    const stage = hasStage && <List
        dataSource={stagedRecipes}
        itemLayout="horizontal"
        renderItem={recipe =>
            <RecipeListItem recipe={recipe}
                            mine
                            staged />}
        footer={<Button.Group>
            <AddToList
                key="add-to-list"
                onClick={listId => Dispatcher.dispatch({
                    type: RecipeActions.ASSEMBLE_SHOPPING_LIST,
                    recipeIds: [...stagedIds],
                    listId,
                })}
            />
        </Button.Group>}
    />;

    const content = !libraryLO.hasValue()
        ? <Spin tip="Loading recipe library..."/>
        : <React.Fragment>
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
            <SearchFilter
                onChange={updateFilter}
                onFilter={sendFilter}
                term={filter}
            />

            <List
                dataSource={libraryLO.getValueEnforcing()
                    .filter(r => !stagedIds.has(r.id))}
                itemLayout="horizontal"
                renderItem={recipe =>
                    <RecipeListItem recipe={recipe}
                                    mine={recipe.ownerId === me.id} />}
            />
        </React.Fragment>;

    return <React.Fragment>
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
    </React.Fragment>;
};

RecipesList.defaultProps = {
    filter: "",
    scope: "mine"
};

RecipesList.propTypes = {
    me: PropTypes.object.isRequired,
    libraryLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired,
    stagedRecipes: PropTypes.arrayOf(Recipe).isRequired,
    filter: PropTypes.string,
    scope: PropTypes.string,
    shoppingList: loadObjectOf(PropTypes.array),
};

export default RecipesList;
