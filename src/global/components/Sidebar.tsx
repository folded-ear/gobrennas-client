import * as React from "react";
import { Box, Drawer as MuiDrawer, Paper, Tab, Tabs } from "@mui/material";
import { SIDEBAR_DEFAULT_WIDTH } from "@/global/constants";
import { styled } from "@mui/material/styles";
import { Link, useLocation } from "react-router-dom";

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

export const SidebarDrawer = ({ children }: React.PropsWithChildren) => {
    const { pathname } = useLocation();
    const currentTab = pathname.split("/").includes("buckets")
        ? "buckets"
        : "library";

    return (
        <Drawer variant="permanent" anchor="right">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={currentTab} aria-label="Sidebar Tabs">
                    <Tab
                        value="library"
                        component={Link}
                        to={`/plan/14/library`}
                        label="Library Search"
                    />
                    <Tab
                        value="buckets"
                        component={Link}
                        to={`/plan/14/buckets`}
                        label="Planned Buckets"
                    />
                </Tabs>
            </Box>
            <Paper>{children}</Paper>
        </Drawer>
    );
};
