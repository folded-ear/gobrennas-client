import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {Menu, Icon} from 'antd';

import Recipes from './components/Recipes';
import RecipeAdd from './components/RecipeAdd';

import './App.css';

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
          <Route exact path="/" component={Recipes}/>
          <Route path="/add" component={RecipeAdd}/>
        </div>
        
      </Router>
    </div>
  );
}

export default App;
