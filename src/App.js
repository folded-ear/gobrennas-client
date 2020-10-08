import {ThemeProvider} from "@material-ui/core/styles";
import {Container as Content} from "@material-ui/core";
import {Container} from "flux/utils";
import React, {Component} from "react";
import {Switch} from "react-router-dom";
import "./App.scss";
import Dispatcher from "./data/dispatcher";
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

class App extends Component {
    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }
    
    handleLogout() {
        Dispatcher.dispatch({
            type: UserActions.LOGOUT,
        });
    }
    
    render() {
        const {
            authenticated,
            userLO,
            newVersionAvailable,
        } = this.props;

        if (!userLO.isDone()) {
            return <ThemeProvider theme={theme}>
                <AppHeader authenticated={false} />
                <LoadingIndicator/>
            </ThemeProvider>;
        }
        const currentUser = authenticated
            ? userLO.getValueEnforcing()
            : null;
        
        return (
            <ThemeProvider theme={theme}>
                {newVersionAvailable && <NewVersionAvailable />}
                <AppHeader authenticated={authenticated} onLogout={this.handleLogout}/>

                <Content style={{paddingBottom: "3em"}}>
                    <Switch>
                        {routes.public.map(route => {
                            return (
                                <FluxRoute
                                    key={route.path}
                                    path={route.path}
                                    render={props => <route.component authenticated={authenticated} {...props} />}
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

                        <FluxRoute path="/login" render={(props) => <Login
                            authenticated={authenticated} {...props} />} />
                        <FluxRoute component={NotFound} />
                    </Switch>
                
                </Content>
            </ThemeProvider>
        );
    }
}

export default Container.createFunctional(
    props => <App {...props} />,
    () => [
        UserStore,
        WindowStore,
    ],
    () => ({
        authenticated: UserStore.isAuthenticated(),
        userLO: UserStore.getProfileLO(),
        newVersionAvailable: WindowStore.isNewVersionAvailable(),
    }),
);
