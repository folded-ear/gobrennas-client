import * as React from "react";
import {
    Navigation,
    Sidebar
} from "features/Navigation/components/Navigation.elements";
import { Logo } from "features/Navigation/components/Logo";
import Box from "@mui/material/Box";
import { NavItem } from "features/Navigation/components/NavItem";
import {
    AccountCircle as ProfileIcon,
    EventNote as PlanIcon,
    Logout as LogoutIcon,
    MeetingRoom as PantryIcon,
    MenuBook as LibraryIcon,
    ShoppingCart as ShopIcon
} from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader
} from "@mui/material";
import { NavPlanItem } from "features/Navigation/components/NavPlanItem";
import { colorHash } from "constants/colors";
import Typography from "@mui/material/Typography";
import { useLogoutHandler } from "providers/Profile";
import Dispatcher from "data/dispatcher";
import PlanActions from "features/Planner/data/PlanActions";
import { useHistory } from "react-router-dom";

export const DesktopNav = ({expanded, handleExpand, devMode, planItems}) => {
    const history = useHistory();
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
    const onSelectPlan = id => {
        history.push("/plan");
        Dispatcher.dispatch({
            type: PlanActions.SELECT_PLAN,
            id: id,
        });
    }

    return (<>
        <Sidebar
            open={expanded}
            variant="permanent"
        >
            <Logo isExpanded={expanded} onClick={handleExpand} />
            <Box sx={{overflow: 'auto', flex: 1}}>
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
                        icon={<PlanIcon />}
                        title="Plan"
                    />
                    <NavItem
                        to="/shop"
                        value="shop"
                        icon={<ShopIcon />}
                        title="Shop"
                    />
                    {devMode && <NavItem
                        to="/pantry"
                        value="pantry"
                        icon={<PantryIcon />}
                        title="Pantry"
                    />}
                    {/*<NavItem*/}
                    {/*    to="/timers"*/}
                    {/*    value="timers"*/}
                    {/*    icon={<TimerIcon/>}*/}
                    {/*    title="Timers"*/}
                    {/*/>*/}
                </Navigation>
                <Divider/>
                <ListSubheader component="div" id="nested-list-subheader">
                    Plans
                </ListSubheader>
                <Navigation>
                    {planItems && planItems.map(item => (
                        <NavPlanItem
                            id={item.id}
                            onSelect={onSelectPlan}
                            expanded={expanded}
                            name={item.name}
                            color={colorHash(item.id)}
                        />
                    ))}
                </Navigation>
            </Box>
            <Box sx={{alignItem: "bottom"}}>
                <List>
                    <ListItemButton onClick={handleProfile}>
                        <ListItemIcon>
                            <ProfileIcon/>
                        </ListItemIcon>
                        <ListItemText id="profile" primary="My Account" sx={{whiteSpace: "nowrap"}}/>
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
    </>)
}