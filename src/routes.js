import React from "react";
import { Redirect } from "react-router-dom";
import { PlannerController as Planner } from "features/Planner/PlannerController";
import PlannedBucketController from "./features/RecipeDisplay/PlannedBucketController";
import PlannedRecipeController from "./features/RecipeDisplay/PlannedRecipeController";
import Recipe from "./features/RecipeDisplay/RecipeController";
import RecipeEditController from "./features/RecipeEdit/RecipeEditController";
import Shop from "./containers/Shop";
import { SharedRecipeController } from "./features/RecipeDisplay/SharedRecipeController";
import Landing from "./views/Landing";
import Inventory from "./views/inventory/Inventory";
import OAuth2RedirectHandler from "views/user/OAuth2RedirectHandler";
import { UserProfileView } from "views/UserProfile/UserProfileView";
import Profile from "./views/user/Profile";
import Foodinger from "views/Foodinger";
import { RecipeAddController } from "./features/RecipeEdit/RecipeAddController";
import { Library } from "views/Library";
import PantryItemAdmin from "./features/PantryItemAdmin/PantryItemAdmin";

const routes = {
    public: [
        { path: "/", component: Landing, exact: true },
        { path: "/foodinger", component: Foodinger },
        { path: "/post-oauth2/redirect", component: OAuth2RedirectHandler },
        {
            path: "/share/recipe/:slug/:secret/:id",
            component: SharedRecipeController,
        },
    ],
    private: [
        { path: "/user-profile", component: UserProfileView },
        { path: "/profile", component: Profile },
        { path: "/library/recipe/:id/edit", component: RecipeEditController },
        {
            path: "/library/recipe/:id/make-copy",
            component: RecipeEditController,
        },
        { path: "/library/recipe/:id", component: Recipe },
        { path: "/library", component: Library },
        { path: "/add", component: RecipeAddController },
        // eslint-disable-next-line react/display-name
        { path: "/tasks", component: () => <Redirect to="/plan" /> },
        { path: "/plan/:pid/recipe/:rid", component: PlannedRecipeController },
        { path: "/plan/:pid/bucket/:bid", component: PlannedBucketController },
        { path: "/plan/:pid", component: Planner },
        { path: "/plan", component: Planner },
        { path: "/shop", component: Shop },
        { path: "/pantry", component: () => <Redirect to="/inventory" /> },
        { path: "/inventory", component: Inventory },
        { path: "/pantry-item-admin", component: PantryItemAdmin },
    ],
};

export default routes;
