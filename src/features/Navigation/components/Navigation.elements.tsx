import { styled } from "@mui/material/styles";
import {
    AppBar,
    Container,
    ContainerProps,
    Drawer,
    List
} from "@mui/material";

export const TOP_MARGIN = 20
const drawerWidthOpen = 240;
const drawerWidthClosed = 58;

export const Header = styled(AppBar)(({theme}) => ({
    zIndex: theme.zIndex.drawer + 10,
    backgroundColor: theme.palette.primary.main,
    height: 5,
}))

export const Sidebar = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
        ({theme, open}) => ({
            // open ? openedMixin(theme) : closedMixin(theme),
    '& .MuiDrawer-paper': {
        width: open ? drawerWidthOpen : drawerWidthClosed,
        borderRightWidth: 0,
        overflowX: 'hidden',
        height: '100%',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: open? theme.transitions.duration.leavingScreen : theme.transitions.duration.enteringScreen,
        }),
    }
}))

export const Navigation = styled(List)({
    backgroundColor: "transparent"
})

interface ExpandedProps extends ContainerProps {
    open?: boolean
}

export const MainDesktop = styled(Container)<ExpandedProps>(({theme, open}) => ({
    marginTop: TOP_MARGIN,
    ...(open && {
        marginLeft: drawerWidthOpen,
        width: `calc(100% - ${drawerWidthOpen}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
    ...(!open && {
        marginLeft: drawerWidthClosed,
        width: `calc(100% - ${drawerWidthClosed}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    })
}))

export const MainMobile = styled(Container)({

})