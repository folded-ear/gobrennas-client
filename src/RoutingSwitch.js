import PropTypes from "prop-types";
import React from "react";
import { Switch } from "react-router-dom";
import useProfileLO from "./data/useProfileLO";
import FluxRoute from "./views/common/FluxRoute";
import NotFound from "./views/common/NotFound";
import PrivateRoute from "./views/common/PrivateRoute";
import Login from "./views/user/Login";

function RoutingSwitch(props) {
    const {
        authenticated,
        routes,
    } = props;

    const userLO = useProfileLO();
    const currentUser = authenticated
        ? userLO.getValueEnforcing()
        : null;

    return <Switch>
        {routes.public.map(route =>
            <FluxRoute
                key={route.path}
                path={route.path}
                render={props => <route.component
                    authenticated={authenticated} {...props} />}
                exact={route.exact}
            />)}
        {routes.private.map(route =>
            <PrivateRoute
                key={route.path}
                path={route.path}
                component={route.component}
                currentUser={currentUser}
                authenticated={authenticated}
            />)}
        <FluxRoute
            path="/login"
            render={(props) => <Login
                authenticated={authenticated}
                {...props}
            />}
        />
        <FluxRoute component={NotFound} />
    </Switch>;
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
