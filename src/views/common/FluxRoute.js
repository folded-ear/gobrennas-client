import PropTypes from "prop-types";
import React from "react";
import { Route } from "react-router-dom";
import Dispatcher from "../../data/dispatcher";
import RouteActions from "../../data/RouteActions";
import RouteStore from "../../data/RouteStore";
import GTag from "../../GTag";

const FluxRoute = ({render, component: Component, ...rest}) => (
    <Route
        {...rest}
        render={props => {
            const { match, location } = props;
            const curr = RouteStore.getState();
            if (curr == null || match.url !== curr.url) {
                const work = () => Dispatcher.dispatch({
                    type: RouteActions.MATCH,
                    match,
                    location,
                });
                Dispatcher.isDispatching()
                    ? setTimeout(work)
                    : work();
                GTag("set", "page_path", match.url);
                GTag("set", "page_title", match.path);
                GTag("event", "page_view");
            }
            // this follows Route's split behaviour
            return Component != null
                ? <Component {...props} />
                : render(props);
        }
        }
    />
);

FluxRoute.propTypes = {
    render: PropTypes.func,
    component: PropTypes.elementType,
    match: PropTypes.object,
    location: PropTypes.object,
};

export default FluxRoute;
