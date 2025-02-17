import PollingSynchronizer from "@/data/PollingSynchronizer";
import queryClient from "@/data/queryClient";
import { NavigationController } from "@/features/Navigation/NavigationController";
import NewVersionPrompt from "@/NewVersionPrompt";
import { client as apolloClient } from "@/providers/ApolloClient";
import { AuthTokenProvider } from "@/providers/AuthToken";
import { IsMobileProvider } from "@/providers/IsMobile";
import { ProfileProvider } from "@/providers/Profile";
import ImperativeFlux from "@/util/ImperativeFlux";
import SnackPack from "@/views/common/SnackPack";
import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import {
    StyledEngineProvider,
    Theme,
    ThemeProvider,
} from "@mui/material/styles";
import { QueryClientProvider } from "react-query";
import "./GoBrennas.scss";
import routes from "./routes";
import RoutingSwitch from "./RoutingSwitch";
import { useBfsTheme } from "./theme";

declare module "@mui/styles/defaultTheme" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}

function GoBrennas() {
    return (
        <ApolloProvider client={apolloClient}>
            <AuthTokenProvider>
                <ProfileProvider>
                    <IsMobileProvider>
                        <QueryClientProvider client={queryClient}>
                            <PollingSynchronizer />
                            <ImperativeFlux />
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={useBfsTheme()}>
                                    <CssBaseline />
                                    <NavigationController>
                                        <NewVersionPrompt />
                                        <RoutingSwitch routes={routes} />
                                    </NavigationController>
                                    <SnackPack />
                                </ThemeProvider>
                            </StyledEngineProvider>
                        </QueryClientProvider>
                    </IsMobileProvider>
                </ProfileProvider>
            </AuthTokenProvider>
        </ApolloProvider>
    );
}

export default GoBrennas;
