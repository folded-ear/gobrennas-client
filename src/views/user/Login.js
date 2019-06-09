import React, { Component } from 'react';
import { GOOGLE_AUTH_URL } from '../../constants';
import { Redirect } from 'react-router-dom'
import googleLogo from '../../assets/img/google-logo.png';

class Login extends Component {
    componentDidMount() {
        // If the OAuth2 login encounters an error, the user is redirected to the /login page with an error.
        // Here we display the error and then remove the error query parameter from the location.
        if(this.props.location.state && this.props.location.state.error) {
            console.log(this.props.location.state.error);
        }
    }
    
    render() {
        
        const { authenticated } = this.props;
        
        if(authenticated) {
            return <Redirect
                to={{
                pathname: "/",
                state: { from: this.props.location }
            }}/>;            
        }

        return (
            <div className="login-container">
                <h1>Login</h1>
                <a className="btn btn-block social-btn google" href={GOOGLE_AUTH_URL}>
                    <img src={googleLogo} alt="Google" /> Log in with Google</a>
            </div>
        );
    }
}

export default Login;