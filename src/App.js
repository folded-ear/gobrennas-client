import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import Recipes from './components/Recipes';
import RecipeAdd from './components/RecipeAdd';

import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/">Recipes</Link>
            </li>
            <li>
              <Link to="/add">Add New Recipe</Link>
            </li>
          </ul>
      
          <hr />
      
          <Route exact path="/" component={Recipes} />
          <Route path="/add" component={RecipeAdd} />
        </div>
      </Router>
    </div>
  );
}

export default App;
