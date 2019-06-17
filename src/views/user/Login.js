import React, {Component} from 'react';
import {GOOGLE_AUTH_URL} from '../../constants';
import {Redirect} from 'react-router-dom'
import { Button } from 'antd'

class Login extends Component {
    
    componentDidMount() {
        // If the OAuth2 login encounters an error, the user is redirected to the /login page with an error.
        // Here we display the error and then remove the error query parameter from the location.
        if (this.props.location.state && this.props.location.state.error) {
            console.log(this.props.location.state.error);
        }
    }
    
    render() {
        
        const {authenticated} = this.props;
        
        if (authenticated) {
            return <Redirect
                to={{
                    pathname: "/",
                    state: {from: this.props.location}
                }}/>;
        }
        
        return (
            <div className="login-container">
                <div className="login-content">
                    <h1>Welcome to Foodinger</h1>
                    <p>Login to continue...</p>
                    <Button type="primary" icon="google" href={GOOGLE_AUTH_URL}>Login</Button>
                </div>
            </div>
        );
    }
}

export default Login;