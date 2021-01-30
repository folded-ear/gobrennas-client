import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { Switch } from "react-router-dom";
import "./App.scss";
import Dispatcher from "./data/dispatcher";
import useFluxStore from "./data/useFluxStore";
import UserActions from "./data/UserActions";
import UserStore from "./data/UserStore";
import WindowStore from "./data/WindowStore";
import routes from "./routes";
import theme from "./theme";
import AppHeader from "./views/common/AppHeader";
import FluxRoute from "./views/common/FluxRoute";
import LoadingIndicator from "./views/common/LoadingIndicator";
import NotFound from "./views/common/NotFound";
import PrivateRoute from "./views/common/PrivateRoute";
import NewVersionAvailable from "./views/NewVersionAvailable";
import Login from "./views/user/Login";

const App = () => {
    const [authenticated, userLO] = useFluxStore(
        () => [
            UserStore.isAuthenticated(),
            UserStore.getProfileLO(),
        ],
        [UserStore],
    );
    const newVersionAvailable = useFluxStore(
        () => WindowStore.isNewVersionAvailable(),
        [WindowStore],
    );

    const handleLogout = () =>
        Dispatcher.dispatch({
            type: UserActions.LOGOUT,
        });

    if (!userLO.isDone()) {
        return <ThemeProvider theme={theme}>
            {newVersionAvailable && <NewVersionAvailable />}
            <AppHeader authenticated={false} />
            <LoadingIndicator />
        </ThemeProvider>;
    }

    const currentUser = authenticated
        ? userLO.getValueEnforcing()
        : null;

    return <ThemeProvider theme={theme}>
        <CssBaseline />
        {newVersionAvailable && <NewVersionAvailable />}
        <AppHeader
            authenticated={authenticated}
            onLogout={handleLogout}
        />
        <Switch>
            {routes.public.map(route => {
                return (
                    <FluxRoute
                        key={route.path}
                        path={route.path}
                        render={props => <route.component
                            authenticated={authenticated} {...props} />}
                        exact={route.exact}
                    />
                );
            })}
            {routes.private.map(route => {
                return (
                    <PrivateRoute
                        key={route.path}
                        path={route.path}
                        component={route.component}
                        currentUser={currentUser}
                        authenticated={authenticated}
                    />
                );
            })}
            <FluxRoute
                path="/login"
                render={(props) => <Login
                    authenticated={authenticated}
                    {...props}
                />}
            />
            <FluxRoute component={NotFound} />
        </Switch>
    </ThemeProvider>;
};

export default App;
