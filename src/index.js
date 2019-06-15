import React from 'react';
import ReactDOM from 'react-dom';
import Dispatcher from "./data/dispatcher";
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ACCESS_TOKEN } from "./constants/index";
import UserActions from "./data/UserActions";

ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));

// see if we have tidbits in local storage...
const accessToken = localStorage.getItem(ACCESS_TOKEN);
if (accessToken) {
    Dispatcher.dispatch({
        type: UserActions.LOGIN,
        token: accessToken,
    });
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
