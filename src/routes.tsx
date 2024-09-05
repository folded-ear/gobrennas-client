import { Redirect, RouteProps } from "react-router-dom";
import { Planner } from "@/views/Planner";
import PlannedBucketController from "./features/RecipeDisplay/PlannedBucketController";
import PlannedRecipeController from "./features/RecipeDisplay/PlannedRecipeController";
import RecipeController from "./features/RecipeDisplay/RecipeController";
import RecipeEditController from "./features/RecipeEdit/RecipeEditController";
import Shop from "./containers/Shop";
import { SharedRecipeController } from "./features/RecipeDisplay/SharedRecipeController";
import Landing from "./views/Landing";
import OAuth2RedirectHandler from "@/views/user/OAuth2RedirectHandler";
import Profile from "./features/UserProfile/components/Profile";
import Foodinger from "@/views/Foodinger";
import { RecipeAddController } from "./features/RecipeEdit/RecipeAddController";
import PantryItemAdmin from "./features/PantryItemAdmin/PantryItemAdmin";
import { CurrentPlanSidebar } from "@/features/RecipeLibrary/components/CurrentPlanSidebar";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { LibraryController } from "@/features/RecipeLibrary/LibraryController";
import { SidebarDrawer as PlannerSidebar } from "@/features/Planner/components/Sidebar";
import { Welcome } from "@/views/Welcome";
import { PlannerController } from "@/features/Planner/PlannerController";

interface BfsRouteComponentProps extends RouteComponentProps {
    readonly authenticated: boolean;
}

// Don't allow an undefined component. Not sure why that'd be useful.
type BfsRouteComponent =
    | React.ComponentType<BfsRouteComponentProps>
    | React.ComponentType<any>;

export interface BfsRoute extends RouteProps {
    // React Router allows a string[], but we don't use that. We do, however use
    // paths as keys, which must be string. Express that here, as well as that
    // a path is required and cannot be null/undefined. At least for now. :)
    readonly path: string;
    readonly component: BfsRouteComponent;
}

interface PrivateBfsRoute extends BfsRoute {
    // sidebars are not supported on mobile (as you'd expect).
    readonly sidebar?: BfsRouteComponent | undefined;
}

export interface BfsRoutes {
    readonly public: BfsRoute[];
    readonly private: PrivateBfsRoute[];
}

const routes: BfsRoutes = {
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
        { path: "/user-profile", component: () => <Redirect to="/profile" /> },
        { path: "/profile", component: Profile },
        { path: "/library/recipe/:id/edit", component: RecipeEditController },
        {
            path: "/library/recipe/:id/make-copy",
            component: RecipeEditController,
        },
        {
            path: "/library/recipe/:id",
            component: RecipeController,
            sidebar: CurrentPlanSidebar,
        },
        {
            path: "/library",
            component: LibraryController,
            sidebar: CurrentPlanSidebar,
        },
        { path: "/add", component: RecipeAddController },
        // eslint-disable-next-line react/display-name
        { path: "/tasks", component: () => <Redirect to="/plan" /> },
        { path: "/plan/:pid/recipe/:rid", component: PlannedRecipeController },
        { path: "/plan/:pid/bucket/:bid", component: PlannedBucketController },
        {
            path: "/plan/:pid",
            component: PlannerController,
            sidebar: PlannerSidebar,
        },
        {
            path: "/plan",
            component: Planner,
            sidebar: PlannerSidebar,
        },
        { path: "/shop", component: Shop },
        { path: "/pantry-item-admin", component: PantryItemAdmin },
        { path: "/welcome", component: Welcome },
    ],
};

export default routes;
