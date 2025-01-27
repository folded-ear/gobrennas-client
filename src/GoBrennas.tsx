import "./GoBrennas.scss";
import { ProfileProvider } from "@/providers/Profile";
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
import { ApolloProvider } from "@apollo/client";
import { client as apolloClient } from "@/providers/ApolloClient";
import { AuthTokenProvider } from "@/providers/AuthToken";
import { IsMobileProvider } from "@/providers/IsMobile";
import { QueryClientProvider } from "react-query";
import queryClient from "@/data/queryClient";
import PollingSynchronizer from "@/data/PollingSynchronizer";
import ImperativeFlux from "@/util/ImperativeFlux";

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
