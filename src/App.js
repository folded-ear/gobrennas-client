import React, { useState } from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {Menu} from 'antd';
import Recipes from './containers/Recipes';
import RecipeAdd from './views/RecipeAdd';

import Actions from './data/actions';

import './App.scss';

Actions.fetchRecipes();

function App() {
  
  const [current, setCurrent] = useState('recipes');
  
  return (
    <div className="App">
      <Router>
        <h1>CookBook</h1>
        <Menu
          onClick={(e) => setCurrent(e.key)}
          selectedKeys={[current]}
          mode="horizontal">
          <Menu.Item key="recipes">
            <Link to="/">Recipes</Link>
          </Menu.Item>
          <Menu.Item key="add">
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
