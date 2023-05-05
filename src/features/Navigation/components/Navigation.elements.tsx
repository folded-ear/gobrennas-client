import { styled } from "@mui/material/styles";
import {
    alpha,
    AppBar,
    Container,
    ContainerProps,
    Drawer,
    IconButton,
    InputBase,
    List
} from "@mui/material";

export const TOP_MARGIN = 20

const drawerWidthOpen = 240;
const drawerWidthClosed = 58;

const openedMixin = (theme) => ({
    width: drawerWidthOpen,
    borderRightWidth: 0,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
});

const closedMixin = (theme) => ({
    width: drawerWidthClosed,
    borderRightWidth: 0,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
});

export const Header = styled(AppBar, {shouldForwardProp: (prop) => prop !== 'open'})(({theme}) => ({
    zIndex: theme.zIndex.drawer + 10,
    backgroundColor: theme.palette.primary.main,
}))

export const Sidebar = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
        ({theme, open}) => ({
    '& .MuiDrawer-paper': open ? openedMixin(theme) : closedMixin(theme),
}))

export const Navigation = styled(List)({
    backgroundColor: "transparent"
})

interface ExpandedProps extends ContainerProps {
    open?: boolean
}

export const Main = styled(Container)<ExpandedProps>(({theme, open}) => ({
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

export const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    flex: 1,
}));

export const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

export const IconBtnLight = styled(IconButton)(({theme}) => ({
    color: theme.palette.primary.contrastText
}))