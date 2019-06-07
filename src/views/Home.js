import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {Layout, Menu} from 'antd';
import Recipes from '../containers/Recipes';

import Actions from '../data/actions';

import PantryItemAdd from "../views/PantryItemAdd";
import PantryItems from "../containers/PantryItems";

function Home() {
  
  const {Header, Content} = Layout;
  const [current, setCurrent] = useState('recipes');
  
  useEffect(() => {
    Actions.fetchRecipes();
    Actions.fetchPantryItems()
  });
  
  return (
    <div className="Home">
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
              <Menu.Item key="pantryitem">
                <Link to="/addpantryitem">Add Pantry Item</Link>
              </Menu.Item>
            </Menu>
          </Header>
          
          <Content>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <Route exact path="/" component={Recipes}/>
              <Route exact path="/add" component={PantryItems}/>
              <Route path="/addpantryitem" component={PantryItemAdd} />
            </div>
          </Content>
        </Layout>
      </Router>
    </div>
  );
}

export default Home;
