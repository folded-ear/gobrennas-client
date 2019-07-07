import Profile from "./views/user/Profile";
import Library from "./containers/Library";
import RecipeAdd from "./views/RecipeAdd";
import Landing from "./views/Landing";
import Tasks from "./containers/Tasks";
import OAuth2RedirectHandler from "./views/user/OAuth2RedirectHandler";
import Recipe from "./containers/Recipe";

const routes = {
    public: [
        {path: "/", component: Landing, exact: true },
        {path: "/oauth2/redirect", component: OAuth2RedirectHandler}
    ],
    private: [
        {path: "/profile",  component: Profile},
        {path: "/library/recipe/:id",   component: Recipe },
        {path: "/library",  component: Library},
        {path: "/add",      component: RecipeAdd},
        {path: "/tasks", component: Tasks}
    ]
};

export default routes;