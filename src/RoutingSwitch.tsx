import { useIsAuthenticated } from "@/providers/Profile";
import { BfsRoutes } from "@/routes";
import { Route, Switch, useLocation } from "react-router-dom";
import NotFound from "./views/common/NotFound";
import PrivateRoute from "./views/common/PrivateRoute";
import Login from "./views/user/Login";

export interface SwitchProps {
    readonly routes: BfsRoutes;
}

const RoutingSwitch = ({ routes }: SwitchProps) => {
    const authenticated = useIsAuthenticated();
    const location = useLocation();

    return (
        <Switch>
            {routes.public.map((route) => (
                <Route
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
            <Route
                path="/login"
                render={(props) => (
                    <Login authenticated={authenticated} {...props} />
                )}
            />
            <Route component={NotFound} />
        </Switch>
    );
};

export default RoutingSwitch;
