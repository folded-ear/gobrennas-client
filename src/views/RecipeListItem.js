import {
    Button,
    List,
} from "antd";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import Dispatcher from "../data/dispatcher";
import FriendStore from "../data/FriendStore";
import LibraryActions from "../data/LibraryActions";
import { LABEL_STAGED_INDICATOR } from "../data/LibraryStore";
import { Recipe } from "../data/RecipeTypes";
import UserStore from "../data/UserStore";
import history from "../util/history";
import { loadObjectOf } from "../util/loadObjectTypes";
import EditButton from "./common/EditButton";
import User from "./user/User";

const {Item} = List;

const RecipeListItem = ({recipe, mine, staged, ownerLO}) => {
    const labelString = (recipe.labels || [])
        .filter(l =>
            l !== LABEL_STAGED_INDICATOR)
        .sort()
        .join(", ");
    const actions = mine
        ? [staged
            ? <Button key={"unstage"}
                      shape={"circle"}
                      icon={"export"}
                      size={"small"}
                      title={"Unstage recipe"}
                      onClick={e => {
                          e.preventDefault();
                          Dispatcher.dispatch({
                              type: LibraryActions.UNSTAGE_RECIPE,
                              id: recipe.id,
                          });
                      }}
            />
            : <Button key={"stage"}
                      shape={"circle"}
                      icon={"import"}
                      size={"small"}
                      title={"Stage recipe"}
                      onClick={e => {
                          e.preventDefault();
                          Dispatcher.dispatch({
                              type: LibraryActions.STAGE_RECIPE,
                              id: recipe.id,
                          });
                      }}
            />,
            <Link key="edit"
                  to={`/library/recipe/${recipe.id}/edit`}><EditButton /></Link>,
        ]
        : ownerLO.hasValue()
            ? [<User key={"user"}
                     {...ownerLO.getValueEnforcing()}
                     iconOnly />]
            : null;
    return (
        <Item
            key={recipe.id}
            onClick={event =>
                event.defaultPrevented || history.push(`/library/recipe/${recipe.id}`)}
            style={{cursor: "pointer"}}
            actions={actions}>
            <List.Item.Meta
                title={recipe.name}
                description={labelString}
            />
        </Item>
    );
};

RecipeListItem.propTypes = {
    recipe: Recipe,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
    staged: PropTypes.bool,
};

export default Container.createFunctional(
    RecipeListItem,
    () => [
        FriendStore,
    ],
    (prevState, props) => ({
        ...props,
        ownerLO: props.mine
            ? UserStore.getProfileLO()
            : FriendStore.getFriendLO(props.recipe.ownerId),
    }),
    {withProps: true},
);