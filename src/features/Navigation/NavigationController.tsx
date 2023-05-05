import * as React from 'react';
import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
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
    ShoppingCart as ShopIcon,
    Timer as TimerIcon,
} from "@mui/icons-material";
import {
    IconBtnLight,
    Main,
    Navigation,
    Sidebar,
} from "features/Navigation/components/Navigation.elements";
import {
    ListItemButton,
    ListSubheader,
} from "@mui/material";
import {
    green,
    pink
} from "@mui/material/colors";
import { FlexBox } from "global/components/FlexBox";

type NavigationControllerProps = {
    authenticated: boolean,
    children?: ReactNode
}

export const NavigationController : React.FC<NavigationControllerProps> = ({authenticated, children}) => {
    const [expanded, setExpanded] = React.useState<boolean>(true)

    const onExpanded = () => setExpanded(!expanded)

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
        <FlexBox>
            <CssBaseline/>
            <Sidebar
                open={expanded}
                variant="permanent"
            >
                <IconBtnLight onClick={onExpanded}>
                    <Menu/>
                </IconBtnLight>
                <Typography variant="h6" noWrap component="div">
                    {expanded ? "Food Software" : "BFS"}
                </Typography>
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
                {children}
            </Main>
        </FlexBox>
    );
}
