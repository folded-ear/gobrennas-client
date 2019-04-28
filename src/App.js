import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {Menu} from 'antd';
import Container from './containers/container';

import Actions from './data/actions';

import RecipeAdd from './components/RecipeAdd';

import './App.css';

Actions.fetchRecipes();

function App() {
  return (
    <div className="App">
      <Router>
        <h1>CookBook</h1>
        <Menu
          mode="horizontal">
          <Menu.Item>
            <Link to="/">Recipes</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to="/add">Add New Recipe</Link>
          </Menu.Item>
        </Menu>
        
        <div>
          <Route exact path="/" component={Container}/>
          <Route path="/add" component={RecipeAdd}/>
        </div>
      </Router>
    </div>
  );
}

export default App;
