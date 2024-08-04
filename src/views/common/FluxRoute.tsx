import * as React from "react";
import { Route, RouteProps } from "react-router-dom";
import Dispatcher from "@/data/dispatcher";
import RouteActions from "@/data/RouteActions";
import RouteStore from "@/data/RouteStore";
import GTag from "../../GTag";

const FluxRoute: React.FC<RouteProps> = ({
    render,
    component: Component,
    ...rest
}) => (
    <Route
        {...rest}
        render={(props) => {
            const { match, location } = props;
            const curr = RouteStore.getState();
            if (curr == null || match.url !== curr.url) {
                const work = () =>
                    Dispatcher.dispatch({
                        type: RouteActions.MATCH,
                        match,
                        location,
                    });
                setTimeout(work);
                GTag("set", "page_path", match.url);
                GTag("set", "page_title", match.path);
                GTag("event", "page_view");
            }
            // this follows Route's split behaviour
            return Component != null ? (
                <Component {...props} />
            ) : render ? (
                render(props)
            ) : null;
        }}
    />
);

export default FluxRoute;
