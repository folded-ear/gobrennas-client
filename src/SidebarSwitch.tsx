import { SwitchProps } from "@/RoutingSwitch";
import { Route, Switch } from "react-router-dom";
import { useIsAuthenticated } from "@/providers/Profile";

const SidebarSwitch = ({ routes }: SwitchProps) => {
    const authenticated = useIsAuthenticated();
    // Don't move the conditional inside render up to here (or a .filter)! It's
    // important the same <Route> are rendered here as for the main content, so
    // sidebars use the same scoping. Otherwise, you get weird 'exact' effects.
    const children = routes.private.map((route) => (
        <Route
            key={route.path}
            path={route.path}
            render={(props) =>
                route.sidebar ? (
                    <route.sidebar authenticated={authenticated} {...props} />
                ) : null
            }
            exact={route.exact}
        />
    ));
    return <Switch>{children}</Switch>;
};

export default SidebarSwitch;
