import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {Layout, Menu} from 'antd';
import Recipes from './containers/Recipes';
import RecipeAdd from './views/RecipeAdd';

import Actions from './data/actions';

import './App.scss';

function App() {
  
  const {Header, Content} = Layout;
  const [current, setCurrent] = useState('recipes');
  
  useEffect(() => {
    Actions.fetchRecipes();
  });
  
  return (
    <div className="App">
      <Router>
        <Layout className="layout">
          <Header>
            <div className="logo">Cookbook</div>
            <Menu
              theme="dark"
              style={{ lineHeight: '64px' }}
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
          </Header>
          
          <Content>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <Route exact path="/" component={Recipes}/>
              <Route path="/add" component={RecipeAdd}/>
            </div>
          </Content>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
