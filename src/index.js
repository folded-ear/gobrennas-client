import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import debounce from "./util/debounce";
import Dispatcher from "./data/dispatcher";
import WindowActions from "./data/WindowActions";

ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));

window.addEventListener("resize", debounce(() =>
    Dispatcher.dispatch({
        type: WindowActions.RESIZE,
    }), 500));

// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
    // called when the cache is populated (i.e., offline will work)
    onSuccess: registration => Dispatcher.dispatch({
        type: WindowActions.PWA_CACHE_HOT,
    }),
    // called when there is a new version of the app available
    onUpdate: registation => Dispatcher.dispatch({
        type: WindowActions.NEW_VERSION_AVAILABLE,
    }),
});
