import {
    useIsProfileInitializing,
    useIsProfilePending,
    useProfile,
} from "@/providers/Profile";
import { BfsRoute } from "@/routes";
import { Location } from "history";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import LoadingIndicator from "./LoadingIndicator";

function AuthenticatedHelper({ render, ...route }) {
    return render({
        currentUser: useProfile(),
        ...route,
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

interface Props extends BfsRoute {
    authenticated: boolean;
}

const PrivateRoute: React.FC<Props> = ({
    component: Component,
    authenticated,
    ...route
}) => {
    if (useIsProfilePending()) {
        return <LoadingIndicator />;
    }
    return (
        <Route
            {...route}
            render={(props) => {
                if (authenticated) {
                    return (
                        <AuthenticatedHelper
                            render={(props) => <Component {...props} />}
                            {...route}
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
