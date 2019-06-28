import React from 'react';
import {
    NavLink,
    withRouter,
} from 'react-router-dom';
import {
    Layout,
    Menu,
} from "antd";

const {Header} = Layout;

const AppHeader = ({authenticated, onLogout, location}) => {

    if (!authenticated) {
        return (
            <Header>
                <Menu
                    theme="dark"
                    style={{lineHeight: '10px'}}
                    mode="horizontal">
                </Menu>
            </Header>
        )
    }

    return (
        <Header>
            <Menu
                theme="dark"
                style={{lineHeight: '64px'}}
                selectedKeys={[location.pathname]}
                mode="horizontal">
                <Menu.Item>
                    <NavLink to="/" className="logo">FOODINGER</NavLink>
                </Menu.Item>
                <Menu.Item key="/recipes">
                    <NavLink to="/recipes">Recipes</NavLink>
                </Menu.Item>
                <Menu.Item key="/add">
                    <NavLink to="/add">Add New Recipe</NavLink>
                </Menu.Item>
                <Menu.Item key="/addpantryitem">
                    <NavLink to="/addpantryitem">Add Pantry Item</NavLink>
                </Menu.Item>
                <Menu.Item key="/tasks">
                    <NavLink to="/tasks">Tasks</NavLink>
                </Menu.Item>
                <Menu.Item key="/profile">
                    <NavLink to="/profile">Profile</NavLink>
                </Menu.Item>
                <Menu.Item onClick={onLogout}>Logout</Menu.Item>
            </Menu>
        </Header>
    )
};

export default withRouter(AppHeader);