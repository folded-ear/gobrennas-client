import Profile from "./views/user/Profile";
import Recipes from "./containers/Recipes";
import RecipeAdd from "./containers/RecipeAdd";
import Landing from "./views/Landing";
import PantryItemAdd from "./views/PantryItemAdd";
import Tasks from "./containers/Tasks";
import OAuth2RedirectHandler from "./views/user/OAuth2RedirectHandler";

const routes = {
    public: [
        {path: "/", component: Landing, exact: true },
        {path: "/oauth2/redirect", component: OAuth2RedirectHandler}
    ],
    private: [
        {path: "/profile", component: Profile},
        {path: "/recipes", component: Recipes},
        {path: "/add", component: RecipeAdd},
        {path: "/addpantryitem", component: PantryItemAdd},
        {path: "/tasks", component: Tasks}
    ]
};

export default routes;