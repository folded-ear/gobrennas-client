import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';
import AppHeader from './views/common/AppHeader';
import Home from './views/Home';
import Login from './views/user/login/Login';
import Signup from './views/user/signup/Signup';
import Profile from './views/user/profile/Profile';
import OAuth2RedirectHandler from './views/user/oauth2/OAuth2RedirectHandler';
import NotFound from './views/common/NotFound';
import LoadingIndicator from './views/common/LoadingIndicator';
import { getCurrentUser } from './utils/APIUtils';
import { ACCESS_TOKEN } from './constants';
import PrivateRoute from './views/common/PrivateRoute';
import './App.scss';

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
    if(this.state.loading) {
      return <LoadingIndicator />
    }
    
    return (
      <div className="app">
        <div className="app-top-box">
          <AppHeader authenticated={this.state.authenticated} onLogout={this.handleLogout} />
        </div>
        <div className="app-body">
          <Switch>
            <Route exact path="/" component={Home}></Route>
            <PrivateRoute path="/profile" authenticated={this.state.authenticated} currentUser={this.state.currentUser}
                          component={Profile} />
            <Route path="/login"
                   render={(props) => <Login authenticated={this.state.authenticated} {...props} />} />
            <Route path="/signup"
                   render={(props) => <Signup authenticated={this.state.authenticated} {...props} />} />
            <Route path="/oauth2/redirect" component={OAuth2RedirectHandler} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
