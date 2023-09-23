import React, { ComponentType } from "react";
import { Redirect } from "react-router-dom";
import {
  useIsProfileInitializing,
  useIsProfilePending,
  useProfile
} from "../../providers/Profile";
import FluxRoute from "./FluxRoute";
import LoadingIndicator from "./LoadingIndicator";
import { Location } from "history";

function AuthenticatedHelper({ render, ...rest }) {
    return render({
        currentUser: useProfile(),
        ...rest,
    });
}

const AnonymousHelper: React.FC<{ location: Location }> = ({ location }) => {
    if (useIsProfileInitializing()) {
        return null;
    }
    return (
        <Redirect
            to={{
                pathname: "/login",
                state: { from: location },
            }}
        />
    );
};

interface Props {
    authenticated: boolean;
    component: ComponentType;
    location: Location;
}

const PrivateRoute: React.FC<Props> = ({
    component: Component,
    authenticated,
    ...rest
}) => {
    if (useIsProfilePending()) {
        return <LoadingIndicator />;
    }
    return (
        <FluxRoute
            {...rest}
            render={(props) => {
                if (authenticated) {
                    return (
                        <AuthenticatedHelper
                            render={(props) => <Component {...props} />}
                            {...rest}
                            {...props}
                        />
                    );
                } else {
                    return <AnonymousHelper {...props} />;
                }
            }}
        />
    );
};

export default PrivateRoute;
