import * as React from "react";
import { Drawer as MuiDrawer, Paper } from "@mui/material";
import { SIDEBAR_DEFAULT_WIDTH } from "@/global/constants";
import { styled } from "@mui/material/styles";

const Drawer = styled(MuiDrawer)(({ theme }) => ({
    width: SIDEBAR_DEFAULT_WIDTH,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
        width: SIDEBAR_DEFAULT_WIDTH,
        padding: theme.spacing(2),
        height: "100vh",
    },
})) as typeof MuiDrawer;

export const SidebarDrawer = ({ children }: React.PropsWithChildren) => {
    return (
        <Drawer variant="permanent" anchor="right">
            <Paper>{children}</Paper>
        </Drawer>
    );
};
