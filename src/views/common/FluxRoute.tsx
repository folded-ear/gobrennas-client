import * as React from "react";
import {match, Route} from "react-router-dom";
import Dispatcher from "../../data/dispatcher";
import RouteActions from "../../data/RouteActions";
import RouteStore from "../../data/RouteStore";
import GTag from "../../GTag";
import {RouteComponentProps} from "react-router";

type FluxRouteProps = {
    render?: ((props: RouteComponentProps) => React.ReactNode),
    component?: React.ElementType,
    match?: match,
    location?: any,
}

const FluxRoute: React.FC<FluxRouteProps> = ({render, component: Component, ...rest}) => (
    <Route
        {...rest}
        render={props => {
            const { match, location } = props;
            // @ts-ignore
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
                : render ? render(props) : null;
        }
        }
    />
);

export default FluxRoute;
