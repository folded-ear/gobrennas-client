import React, {Component} from 'react';
import {
    Route,
    Switch
} from 'react-router-dom';
import AppHeader from './views/common/AppHeader';
import Landing from './views/Landing';
import Login from './views/user/Login';
import Profile from './views/user/Profile';
import OAuth2RedirectHandler from './views/user/OAuth2RedirectHandler';
import NotFound from './views/common/NotFound';
import LoadingIndicator from './views/common/LoadingIndicator';
import {getCurrentUser} from './utils/APIUtils';
import {ACCESS_TOKEN} from './constants';
import PrivateRoute from './views/common/PrivateRoute';
import './App.scss';
import {Layout} from "antd";
import Recipes from "./containers/Recipes";
import PantryItemAdd from "./views/PantryItemAdd";
import PantryItems from "./containers/PantryItems";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: false,
            currentUser: null,
            loading: false
        };
        
        this.loadCurrentlyLoggedInUser = this.loadCurrentlyLoggedInUser.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }
    
    componentDidMount() {
        this.loadCurrentlyLoggedInUser();
    }
    
    loadCurrentlyLoggedInUser() {
        this.setState({
            loading: true
        });
        
        getCurrentUser()
            .then(response => {
                this.setState({
                    currentUser: response,
                    authenticated: true,
                    loading: false
                });
            }).catch(error => {
            this.setState({
                loading: false
            });
        });
    }
    
    handleLogout() {
        localStorage.removeItem(ACCESS_TOKEN);
        this.setState({
            authenticated: false,
            currentUser: null
        });
    }
    
    render() {
        const {loading, authenticated, currentUser} = this.state;
        const {Content} = Layout;
        
        if (loading) {
            return <LoadingIndicator/>
        }
        
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
                            component={PantryItems}
                        />
                        <PrivateRoute
                            path="/addpantryitem"
                            authenticated={authenticated}
                            currentUser={currentUser}
                            component={PantryItemAdd}
                        />
                        <Route path="/oauth2/redirect" component={OAuth2RedirectHandler}/>
                        <Route component={NotFound}/>
                    </Switch>
                
                </Content>
            </div>
        );
    }
}

export default App;
