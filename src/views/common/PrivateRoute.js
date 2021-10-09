import PropTypes from "prop-types";
import React from "react";
import { Redirect } from "react-router-dom";
import {
    useIsProfileInitializing,
    useIsProfilePending,
    useProfile,
} from "../../providers/Profile";
import FluxRoute from "./FluxRoute";
import LoadingIndicator from "./LoadingIndicator";

function AuthenticatedHelper({render, ...rest}) {
    return render({
        currentUser: useProfile(),
        ...rest,
    });
}

function AnonymousHelper({location}) {
    if (useIsProfileInitializing()) {
        return null;
    }
    return <Redirect
        to={{
            pathname: "/login",
            state: {from: location},
        }}
    >
        Login?
    </Redirect>;
}

AnonymousHelper.propTypes = {
    location: PropTypes.object,
};

function PrivateRoute({component: Component, authenticated, ...rest}) {
    if (useIsProfilePending()) {
        return <LoadingIndicator />;
    }
    return <FluxRoute
        {...rest}
        render={props => {
            if (authenticated) {
                return <AuthenticatedHelper
                    render={props => <Component {...props} />}
                    {...rest}
                    {...props}
                />;
            } else {
                return <AnonymousHelper
                    {...props}
                />;
            }
        }}
    />;
}

PrivateRoute.propTypes = {
    authenticated: PropTypes.bool.isRequired,
    component: PropTypes.elementType.isRequired,
    location: PropTypes.object,
};

export default PrivateRoute;
