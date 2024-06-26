import PropTypes from "prop-types";
import React from "react";
import { Switch, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "providers/Profile";
import FluxRoute from "./views/common/FluxRoute";
import NotFound from "./views/common/NotFound";
import PrivateRoute from "./views/common/PrivateRoute";
import Login from "./views/user/Login";

function RoutingSwitch(props) {
    const { routes } = props;
    const authenticated = useIsAuthenticated();
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
}

const routeType = PropTypes.shape({
    path: PropTypes.string.isRequired,
    component: PropTypes.elementType.isRequired,
    exact: PropTypes.bool,
});

RoutingSwitch.propTypes = {
    authenticated: PropTypes.bool.isRequired,
    routes: PropTypes.shape({
        public: PropTypes.arrayOf(routeType),
        private: PropTypes.arrayOf(routeType),
    }).isRequired,
};

export default RoutingSwitch;
