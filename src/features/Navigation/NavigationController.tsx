import * as React from 'react';
import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { NavLink, } from "react-router-dom";
import {
    Circle as CircleIcon,
    EventNote as PlanIcon,
    MeetingRoom as PantryIcon,
    Menu,
    MenuBook as LibraryIcon,
    Search as SearchIcon,
    ShoppingCart as ShopIcon,
    Timer as TimerIcon,
} from "@mui/icons-material";
import {
    Header,
    IconBtnLight,
    Main,
    Navigation,
    Search,
    SearchIconWrapper,
    Sidebar,
    StyledInputBase
} from "features/Navigation/components/Navigation.elements";
import {
    ListItemButton,
    ListSubheader,
} from "@mui/material";
import {
    green,
    pink
} from "@mui/material/colors";

type NavigationControllerProps = {
    authenticated: boolean,
    children?: ReactNode
}

export const NavigationController : React.FC<NavigationControllerProps> = ({authenticated, children}) => {
    const [expanded, setExpanded] = React.useState<boolean>(true)

    const onExpanded = () => {
        console.log(expanded)
        setExpanded(!expanded)
    }

    const NavItem = (props) => {
        const {icon, title} = props;
        return (<ListItemButton
            component={NavLink}
            activeStyle={{
                fontWeight: "bold",
                color: "red"
            }}
            {...props}
        >
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            {title}
        </ListItemButton>);
    }

    const NavPlanItem = ({name, color}) => {
        return (<ListItem>
            <ListItemIcon>
                <CircleIcon sx={{ fontSize: 10, color: color }} />
            </ListItemIcon>
            {name}
        </ListItem>)
    }


    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Header position="fixed">
                <Toolbar>
                    <IconBtnLight onClick={onExpanded}>
                        <Menu/>
                    </IconBtnLight>
                    <Typography variant="h6" noWrap component="div">
                        {expanded ? "Food Software" : "BFS"}
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon/>
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{'aria-label': 'search'}}
                        />
                    </Search>
                </Toolbar>
            </Header>
            <Sidebar
                open={expanded}
                variant="permanent"
            >
                <Toolbar/>
                <Box sx={{overflow: 'auto'}}>
                    <Navigation dense>
                        <NavItem
                            to="/library"
                            value="library"
                            icon={<LibraryIcon />}
                            title="Library"
                        />
                        <NavItem
                            to="/plan"
                            value="plan"
                            icon={<PlanIcon/>}
                            title="Plan"
                        />
                        <NavItem
                            to="/shop"
                            value="shop"
                            icon={<ShopIcon/>}
                            title="Shop"
                        />
                        <NavItem
                            to="/pantry"
                            value="pantry"
                            icon={<PantryIcon/>}
                            title="Pantry"
                        />
                        <NavItem
                            to="/timers"
                            value="timers"
                            icon={<TimerIcon/>}
                            title="Timers"
                        />
                    </Navigation>
                    <Divider/>
                    <ListSubheader component="div" id="nested-list-subheader">
                        Plans
                    </ListSubheader>
                    <Navigation>
                        <NavPlanItem name="This Week" color={pink[500]} />
                        <NavPlanItem name="Thanksgiving" color={green[500]} />
                    </Navigation>
                </Box>
            </Sidebar>
            <Main open={expanded}>
                <Toolbar/>
                {children}
            </Main>
        </Box>
    );
}
