import { CSSObject, styled } from "@mui/material/styles";
import {
    AppBar,
    Container,
    ContainerProps,
    Drawer,
    List,
    ListItemIconProps,
    ListSubheader,
} from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import * as React from "react";

export const TOP_MARGIN = 20;
const drawerWidth = 240;

export const Header = styled(AppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 10,
    backgroundColor: theme.palette.primary.main,
    height: 5,
}));

const openedMixin = (theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

export const Sidebar = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(
    ({ theme, open }): CSSObject => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...(open && {
            ...openedMixin(theme),
            "& .MuiDrawer-paper": openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            "& .MuiDrawer-paper": closedMixin(theme),
        }),
    }),
);

export const Navigation = styled(List)({
    backgroundColor: "transparent",
});

interface ExpandedProps extends ContainerProps {
    open?: boolean;
}

export const MainDesktop = styled(Container)<ExpandedProps>(({ theme }) => ({
    marginTop: TOP_MARGIN,
    marginBottom: theme.spacing(1),
}));

export const MainMobile = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(8),
    padding: 0,
}));

export const Subheader = styled(ListSubheader)({
    overflow: "hidden",
    textOverflow: "ellipsis",
});

interface ItemIconProps extends ListItemIconProps {
    open: ExpandedProps["open"];
}

export const ItemIcon: React.FC<ItemIconProps> = (props) => {
    const { open, sx, children, ...passthrough } = props;
    return (
        <ListItemIcon
            {...passthrough}
            sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                ...sx,
            }}
        >
            {children}
        </ListItemIcon>
    );
};
