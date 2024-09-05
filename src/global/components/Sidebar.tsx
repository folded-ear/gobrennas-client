import * as React from "react";
import { Box, Drawer as MuiDrawer, Paper, Tab, Tabs } from "@mui/material";
import { SIDEBAR_DEFAULT_WIDTH } from "@/global/constants";
import { styled } from "@mui/material/styles";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import { CurrentPlanSidebar } from "@/features/RecipeLibrary/components/CurrentPlanSidebar";
import { LibrarySearchSidebar } from "@/features/Planner/components/LibrarySearchSidebar";
import { RouteComponentProps } from "react-router";

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
export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ children }) => {
    const match = useRouteMatch<{ pid?: string }>();

    return (
        <Drawer variant="permanent" anchor="right">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value="search" aria-label="Sidebar Tabs">
                    <Tab
                        value="search"
                        component={Link}
                        to={`${match.url}/search`}
                        label="Library Search"
                    />
                    <Tab
                        value="buckets"
                        component={Link}
                        to={`${match.url}/buckets`}
                        label="Planned Buckets"
                    />
                </Tabs>
            </Box>
            <Switch>
                <Route path={`${match.path}/buckets`}>
                    <CurrentPlanSidebar />
                </Route>
                <Route path={`${match.path}/search`}>
                    <LibrarySearchSidebar />
                </Route>
            </Switch>
            <Paper>{children}</Paper>
        </Drawer>
    );
};
