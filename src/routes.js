import React from "react";
import { Redirect } from "react-router-dom";
import Library from "./containers/Library";
import PlannedBucket from "./containers/PlannedBucket";
import PlannedRecipe from "./containers/PlannedRecipe";
import Recipe from "./containers/Recipe";
import RecipeEdit from "./containers/RecipeEdit";
import Shop from "./containers/Shop";
import Tasks from "./containers/Tasks";
import RecipeAdd from "./views/cook/RecipeAdd";
import SharedRecipe from "./views/cook/SharedRecipe";
import Landing from "./views/Landing";
import Pantry from "./views/pantry/Pantry";
import OAuth2RedirectHandler from "./views/user/OAuth2RedirectHandler";
import Profile from "./views/user/Profile";

const routes = {
    public: [
        {path: "/", component: Landing, exact: true },
        {path: "/post-oauth2/redirect", component: OAuth2RedirectHandler},
        {path: "/share/recipe/:slug/:secret/:id", component: SharedRecipe },
    ],
    private: [
        {path: "/profile",  component: Profile},
        {path: "/library/recipe/:id/edit", component: RecipeEdit},
        {path: "/library/recipe/:id/make-copy", component: RecipeAdd},
        {path: "/library/recipe/:id", component: Recipe},
        {path: "/library", component: Library},
        {path: "/add", component: RecipeAdd},
        // eslint-disable-next-line react/display-name
        {path: "/tasks", component: () => <Redirect to="/plan" />},
        {path: "/plan/:pid/recipe/:rid", component: PlannedRecipe},
        {path: "/plan/:pid/bucket/:bid", component: PlannedBucket},
        {path: "/plan", component: Tasks},
        {path: "/shop", component: Shop},
        {path: "/pantry", component: Pantry},
    ]
};

export default routes;
