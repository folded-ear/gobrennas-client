import PropTypes from "prop-types";
import React from "react";
import { Redirect } from "react-router-dom";
import FluxRoute from "./FluxRoute";

const PrivateRoute = ({ component: Component, authenticated, ...rest }) => (
    <FluxRoute
        {...rest}
        render={props =>
            authenticated ? (
                <Component {...rest} {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/login",
                        state: {from: props.location},
                    }}
                />
            )
        }
    />
);

PrivateRoute.propTypes = {
    authenticated: PropTypes.bool.isRequired,
    component: PropTypes.elementType.isRequired,
    location: PropTypes.object,
};

export default PrivateRoute;
