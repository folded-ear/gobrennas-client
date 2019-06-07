import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Actions from './data/actions';

import './App.scss';
import Home from "./views/Home";

function App() {
  
  useEffect(() => {
    Actions.fetchRecipes();
    Actions.fetchPantryItems()
  });
  
  return (
    <div className="App">
      <Router>
        <Home/>
      </Router>
    </div>
  );
}

export default App;
