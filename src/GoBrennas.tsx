import "./GoBrennas.scss";
import { useIsAuthenticated } from "@/providers/Profile";
import {
    StyledEngineProvider,
    Theme,
    ThemeProvider,
} from "@mui/material/styles";
import { useBfsTheme } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import { NavigationController } from "@/features/Navigation/NavigationController";
import RoutingSwitch from "./RoutingSwitch";
import routes from "./routes";
import SnackPack from "@/views/common/SnackPack";
import NewVersionPrompt from "@/NewVersionPrompt";

declare module "@mui/styles/defaultTheme" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}

function GoBrennas() {
    const authenticated = useIsAuthenticated();

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={useBfsTheme()}>
                <CssBaseline />
                <NavigationController authenticated={authenticated}>
                    {authenticated && <NewVersionPrompt />}
                    <RoutingSwitch
                        routes={routes}
                        authenticated={authenticated}
                    />
                </NavigationController>
                <SnackPack />
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default GoBrennas;
