import * as React from "react";
import { Box, Drawer as MuiDrawer, Paper, Tab, Tabs } from "@mui/material";
import { SIDEBAR_DEFAULT_WIDTH } from "@/global/constants";
import { styled } from "@mui/material/styles";
import {
    Link,
    Route,
    Switch,
    useParams,
    useRouteMatch,
} from "react-router-dom";
import { BodyContainer } from "@/features/RecipeLibrary/components/CurrentPlanSidebar";
import { LibrarySearchController } from "@/features/LibrarySearch/LibrarySearchController";

const Drawer = styled(MuiDrawer)(({ theme }) => ({
    width: SIDEBAR_DEFAULT_WIDTH,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    "& .MuiDrawer-paper": {
        width: SIDEBAR_DEFAULT_WIDTH,
        padding: theme.spacing(2),
        height: "100vh",
        overflowX: "hidden",
    },
})) as typeof MuiDrawer;

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
    return (
        <Drawer variant="permanent" anchor="right">
            <Switch>
                <Route path={`/plan/:pid/buckets`}>
                    <Paper>
                        <SidebarNav />
                        <BodyContainer />
                    </Paper>
                </Route>
                <Route path={`/plan/:pid`}>
                    <Paper>
                        <SidebarNav />
                        <LibrarySearchController />
                    </Paper>
                </Route>
            </Switch>
        </Drawer>
    );
};
