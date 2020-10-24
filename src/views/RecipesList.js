import {
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
import { Recipe } from "../data/RecipeTypes";
import loadObjectOf from "../util/loadObjectOf";
import RecipeListItem from "./RecipeListItem";
import SearchFilter from "./SearchFilter";

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
    const {me, filter, scope, libraryLO, stagedRecipes} = props;
    const hasStage = stagedRecipes.length > 0;
    const stagedIds = new Set(stagedRecipes.map(r => r.id));

    return <React.Fragment>
        <h1>Recipe Library</h1>
        <Row>
            <Col span={24}>
                {hasStage && <React.Fragment>
                    <h2>Staged</h2>
                    <List
                        dataSource={stagedRecipes}
                        itemLayout="horizontal"
                        renderItem={recipe =>
                            <RecipeListItem recipe={recipe}
                                            mine
                                            staged />}
                    />
                    <h2>Everything Else</h2>
                </React.Fragment>}
                {libraryLO.isLoading() && <div>
                    <Spin tip="Loading recipe library..."/>
                </div>}
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
                {libraryLO.hasValue() && <List
                    dataSource={libraryLO.getValueEnforcing()
                        .filter(r => !stagedIds.has(r.id))}
                    itemLayout="horizontal"
                    renderItem={recipe =>
                        <RecipeListItem recipe={recipe}
                                        mine={recipe.ownerId === me.id} />}
                />}
            </Col>
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
};

export default RecipesList;
