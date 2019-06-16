import React, { Component } from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import Dispatcher from './data/dispatcher';
import { Container } from "flux/utils";
import AppHeader from './views/common/AppHeader';
import Landing from './views/Landing';
import Login from './views/user/Login';
import Profile from './views/user/Profile';
import OAuth2RedirectHandler from './views/user/OAuth2RedirectHandler';
import NotFound from './views/common/NotFound';
import LoadingIndicator from './views/common/LoadingIndicator';
import PrivateRoute from './views/common/PrivateRoute';
import './App.scss';
import { Layout } from "antd";
import Recipes from "./containers/Recipes";
import PantryItemAdd from "./views/PantryItemAdd";
import RecipeAdd from "./containers/RecipeAdd";
import Tasks from "./containers/Tasks";
import UserActions from "./data/UserActions";
import UserStore from "./data/UserStore";

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
        const {authenticated, userLO} = this.props;
        const {Content} = Layout;

        if (! userLO.isDone()) {
            return <LoadingIndicator/>
        }
        const currentUser = authenticated
            ? userLO.getValueEnforcing()
            : null;

        return (
            <div>
                <AppHeader authenticated={authenticated} onLogout={this.handleLogout}/>

                <Content>
                    {authenticated ?
                        <p>logged in</p>
                        :
                        <p>Not logged in</p>
                    }
                    <Switch>
                        <Route exact path="/" component={Landing} />
                        <Route
                            path="/login"
                            render={(props) => <Login authenticated={authenticated} {...props} />}
                        />
                        <PrivateRoute
                            path="/profile"
                            authenticated={authenticated}
                            currentUser={currentUser}
                            component={Profile}
                        />
                        <PrivateRoute
                            path="/recipes"
                            authenticated={authenticated}
                            currentUser={currentUser}
                            component={Recipes}
                        />
                        <PrivateRoute
                            path="/add"
                            authenticated={authenticated}
                            currentUser={currentUser}
                            component={RecipeAdd}
                        />
                        <PrivateRoute
                            path="/addpantryitem"
                            authenticated={authenticated}
                            currentUser={currentUser}
                            component={PantryItemAdd}
                        />
                        <PrivateRoute
                            path="/tasks"
                            authenticated={authenticated}
                            currentUser={currentUser}
                            component={Tasks}
                        />
                        <Route path="/oauth2/redirect" component={OAuth2RedirectHandler}/>
                        <Route component={NotFound}/>
                    </Switch>

                </Content>
            </div>
        );
    }
}

export default Container.createFunctional(
    props => <App {...props} />,
    () => [
        UserStore,
    ],
    () => ({
        authenticated: UserStore.isAuthenticated(),
        userLO: UserStore.getProfileLO(),
    }),
);
