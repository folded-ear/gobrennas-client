import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import useIsNewVersionAvailable from "data/useIsNewVersionAvailable";
import { useIsAuthenticated } from "../providers/Profile";
import routes from "../routes";
import RoutingSwitch from "../RoutingSwitch";
import theme from "../theme";
import SnackPack from "../views/common/SnackPack";
import NewVersionAvailable from "../views/NewVersionAvailable";
import MobileHeader from "./MobileHeader";

function MobileApp() {
    const newVersionAvailable = useIsNewVersionAvailable();
    const authenticated = useIsAuthenticated();

    return <ThemeProvider theme={theme}>
        <CssBaseline />
        {authenticated && newVersionAvailable && <NewVersionAvailable />}
        <MobileHeader
            authenticated={authenticated}
        />
        <RoutingSwitch
            routes={routes}
            authenticated={authenticated}
        />
        <SnackPack />
    </ThemeProvider>;
}

export default MobileApp;
