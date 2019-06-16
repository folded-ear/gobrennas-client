import React, {useState} from 'react';
import {
    NavLink
} from 'react-router-dom';
import {
    Layout,
    Menu
} from "antd";

const AppHeader = ({authenticated, onLogout}) => {
    
    const {Header} = Layout;
    const [current, setCurrent] = useState('');
    
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
                onClick={(e) => setCurrent(e.key)}
                selectedKeys={[current]}
                mode="horizontal">
                <Menu.Item>
                    <NavLink to="/" className="logo">FOODINGER</NavLink>
                </Menu.Item>
                <Menu.Item key="recipes">
                    <NavLink to="/recipes">Recipes</NavLink>
                </Menu.Item>
                <Menu.Item key="add">
                    <NavLink to="/add">Add New Recipe</NavLink>
                </Menu.Item>
                <Menu.Item key="pantryitem">
                    <NavLink to="/addpantryitem">Add Pantry Item</NavLink>
                </Menu.Item>
                <Menu.Item>
                    <NavLink to="/tasks">Tasks</NavLink>
                </Menu.Item>
                <Menu.Item>
                    <NavLink to="/profile">Profile</NavLink>
                </Menu.Item>
                <Menu.Item onClick={onLogout}>Logout</Menu.Item>
            </Menu>
        </Header>
    )
};

export default AppHeader;