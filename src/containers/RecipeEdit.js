import { Container } from "flux/utils";
import React from "react";
import { withRouter } from "react-router-dom";
import LibraryStore from "../data/LibraryStore";
import RouteStore from "../data/RouteStore";
import LoadObject from "../util/LoadObject";
import RecipeEdit from "../views/RecipeEdit";

export default withRouter(Container.createFunctional(
    (props) => <RecipeEdit {...props}/>,
    () => [
        LibraryStore,
        RouteStore,
    ],
    () => {
        let recipeLO;
        if (RouteStore.hasMatch()) {
            recipeLO = LibraryStore.getRecipeById(
                parseInt(
                    RouteStore.getMatch().params.id, 10));
        } else {
            // this "loading" actually represents waiting for the ROUTE to load
            // and thus provide the match. But the view doesn't care what we're
            // waiting for, just that we're waiting.
            recipeLO = LoadObject.loading();
        }
        return {
            recipeLO,
        };
    },
));