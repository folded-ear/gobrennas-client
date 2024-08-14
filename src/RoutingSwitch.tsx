import { Switch, useLocation } from "react-router-dom";
import FluxRoute from "./views/common/FluxRoute";
import NotFound from "./views/common/NotFound";
import PrivateRoute from "./views/common/PrivateRoute";
import Login from "./views/user/Login";
import React from "react";
import { BfsRoutes } from "@/routes";

export interface SwitchProps {
    readonly routes: BfsRoutes;
    readonly authenticated: boolean;
}

const RoutingSwitch: React.FC<SwitchProps> = ({ routes, authenticated }) => {
    const location = useLocation();

    return (
        <Switch>
            {routes.public.map((route) => (
                <FluxRoute
                    key={route.path}
                    path={route.path}
                    render={(props) => (
                        <route.component
                            authenticated={authenticated}
                            {...props}
                        />
                    )}
                    exact={route.exact}
                />
            ))}
            {routes.private.map((route) => (
                <PrivateRoute
                    key={route.path}
                    location={location}
                    path={route.path}
                    component={route.component}
                    authenticated={authenticated}
                />
            ))}
            <FluxRoute
                path="/login"
                render={(props) => (
                    <Login authenticated={authenticated} {...props} />
                )}
            />
            <FluxRoute component={NotFound} />
        </Switch>
    );
};

export default RoutingSwitch;
