import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import useIsAuthenticated from "../data/useIsAuthenticated";
import useIsNewVersionAvailable from "../data/useIsNewVersionAvailable";
import useProfileLO from "../data/useProfileLO";
import routes from "../routes";
import RoutingSwitch from "../RoutingSwitch";
import theme from "../theme";
import LoadingIndicator from "../views/common/LoadingIndicator";
import SnackPack from "../views/common/SnackPack";
import NewVersionAvailable from "../views/NewVersionAvailable";
import DesktopHeader from "./DesktopHeader";

function DesktopApp() {
    const newVersionAvailable = useIsNewVersionAvailable();
    const userLO = useProfileLO();
    const authenticated = useIsAuthenticated() && userLO.isDone();

    return <ThemeProvider theme={theme}>
        <CssBaseline />
        {authenticated && newVersionAvailable && <NewVersionAvailable />}
        <DesktopHeader
            authenticated={authenticated}
        />
        {userLO.isDone()
            ? <RoutingSwitch
                routes={routes}
                authenticated={authenticated}
            />
            : <LoadingIndicator />
        }
        <SnackPack />
    </ThemeProvider>;
}

export default DesktopApp;
