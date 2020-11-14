import Button from "@material-ui/core/Button";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
    GOOGLE_AUTH_URL,
    SESSION_STORAGE_POST_LOGIN,
} from "../../constants";
import { setJsonItem } from "../../util/storage";

class Login extends Component {
    
    componentDidMount() {
        // If the OAuth2 login encounters an error, the user is redirected to the /login page with an error.
        // Here we display the error and then remove the error query parameter from the location.
        if (this.props.location.state && this.props.location.state.error) {
            console.log(this.props.location.state.error);
        }
    }
    
    render() {
        const {
            authenticated,
            location,
        } = this.props;

        if (authenticated) {
            return <Redirect
                to={{
                    pathname: "/",
                    state: {from: this.props.location}
                }}/>;
        }

        if (location != null && location.state != null && location.state.from != null) {
            setJsonItem(
                SESSION_STORAGE_POST_LOGIN,
                location.state.from,
                sessionStorage,
                (k, v) => // omit Router's internal key value
                    k === "key" ? undefined : v
            );
        }
        return (
            <div className="login-container">
                <div className="login-content">
                    <h1>Welcome to Foodinger</h1>
                    <Button
                        color="primary"
                        variant="outlined"
                        href={GOOGLE_AUTH_URL}
                    >
                        Login with Google
                    </Button>
                </div>
            </div>
        );
    }
}

export default Login;
