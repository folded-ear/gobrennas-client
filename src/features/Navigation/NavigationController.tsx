import * as React from 'react';
import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {
    AccountCircle as ProfileIcon,
    EventNote as PlanIcon,
    ExitToApp as LogoutIcon,
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
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import { FlexBox } from "global/components/FlexBox";
import { NavItem } from "features/Navigation/components/NavItem";
import { NavPlanItem } from "features/Navigation/components/NavPlanItem";
import useFluxStore from "data/useFluxStore";
import { ripLoadObject } from "util/ripLoadObject";
import planStore from "features/Planner/data/planStore";
import { useLogoutHandler } from "providers/Profile";
import { useHistory } from "react-router-dom";

type NavigationControllerProps = {
    authenticated: boolean,
    children?: ReactNode
}

// TODO randomize color map for plans
export const NavigationController : React.FC<NavigationControllerProps> = ({authenticated, children}) => {
    const [expanded, setExpanded] = React.useState<boolean>(true)
    const onExpanded = () => setExpanded(!expanded)
    const history = useHistory();
    const state = useFluxStore(
        () => {
            const allPlans = ripLoadObject(planStore.getPlansLO());
            return {
                allPlans
            }
        },
        [
            planStore
        ]
    )

    const handleProfile = e => {
        e.stopPropagation();
        history.push("/profile");
    };
    const doLogout = useLogoutHandler();
    const handleLogout = e => {
        e.preventDefault();
        e.stopPropagation();
        doLogout();
    };


    const {data: navPlanItems, loading, error } = state.allPlans;

    const navItems = [
        {
            id: "library",
            icon: <LibraryIcon />,
            title: "Library"
        },
        {
            id: "plan",
            icon: <PlanIcon />,
            title: "Plan"
        },
        {
            id: "shop",
            icon: <ShopIcon />,
            title: "Shop"
        },
        {
            id: "pantry",
            icon: <PantryIcon />,
            title: "Pantry"
        },
    ]

    if(!authenticated) {
        return (<Main>{children}</Main>)
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
                <Box sx={{overflow: 'auto', flex: 1}}>
                    <Navigation dense>
                        {navItems.map(item => (
                            <NavItem
                                to={`/${item.id}`}
                                value={item.id}
                                icon={item.icon}
                                title={item.title}
                            />
                        ))}
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
                        {navPlanItems && navPlanItems.map(item => (
                            <NavPlanItem name={item.name} color={pink[500]} />
                        ))}
                    </Navigation>
                </Box>
                <Box sx={{alignItem: "bottom"}}>
                    <List>
                        <ListItemButton onClick={handleProfile}>
                            <ListItemIcon>
                                <ProfileIcon/>
                            </ListItemIcon>
                            <ListItemText id="profile" primary="My Account"/>
                        </ListItemButton>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon/>
                            </ListItemIcon>
                            <Typography noWrap>
                                Logout
                            </Typography>
                        </ListItemButton>
                    </List>
                </Box>
            </Sidebar>
            <Main open={expanded}>
                {children}
            </Main>
        </FlexBox>
    );
}
