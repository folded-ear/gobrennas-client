import useIsDevMode from "@/data/useIsDevMode";
import { LibrarySearchController } from "@/features/LibrarySearch/LibrarySearchController";
import { BodyContainer } from "@/features/RecipeLibrary/components/CurrentPlanSidebar";
import { SIDEBAR_DEFAULT_WIDTH } from "@/global/constants";
import { Box, Drawer as MuiDrawer, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import {
    Link,
    Route,
    Switch,
    useParams,
    useRouteMatch,
} from "react-router-dom";

const Drawer = styled(MuiDrawer)({
    width: SIDEBAR_DEFAULT_WIDTH,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    "& .MuiDrawer-paper": {
        width: SIDEBAR_DEFAULT_WIDTH,
        height: "100vh",
        overflowX: "hidden",
    },
}) as typeof MuiDrawer;

type SidebarDrawerProps = React.PropsWithChildren;

const SidebarNav = () => {
    const { pid } = useParams<{ pid?: string }>();
    const { url } = useRouteMatch();
    const currentTab = url.split("/").includes("buckets")
        ? "buckets"
        : "search";

    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={currentTab} aria-label="Sidebar Tabs">
                <Tab
                    value="search"
                    component={Link}
                    to={`/plan/${pid}`}
                    label="Library Search"
                />
                <Tab
                    value="buckets"
                    component={Link}
                    to={`/plan/${pid}/buckets`}
                    label="Planned Buckets"
                />
            </Tabs>
        </Box>
    );
};

export const SidebarDrawer: React.FC<SidebarDrawerProps> = () => {
    const isDevMode = useIsDevMode();

    return isDevMode ? (
        <Drawer variant="permanent" anchor="right">
            <Switch>
                <Route path={`/plan/:pid/buckets`}>
                    <SidebarNav />
                    <BodyContainer />
                </Route>
                <Route path={`/plan/:pid`}>
                    <SidebarNav />
                    <LibrarySearchController />
                </Route>
            </Switch>
        </Drawer>
    ) : null;
};
