import { UserType } from "@/global/types/identity";
import {
    useIsProfileInitializing,
    useIsProfilePending,
    useProfile,
} from "@/providers/Profile";
import { BfsRoute, BfsRouteComponentProps } from "@/routes";
import { Location } from "history";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import LoadingIndicator from "./LoadingIndicator";

interface AuthHelperProps extends BfsRouteComponentProps {
    render: (
        props: { currentUser: UserType } & BfsRouteComponentProps,
    ) => React.ReactNode;
}

const AuthenticatedHelper = ({ render, ...route }: AuthHelperProps) => (
    <>
        {render({
            currentUser: useProfile(),
            ...route,
        })}
    </>
);

const AnonymousHelper = ({ location }: { location: Location }) => {
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
                            authenticated
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
