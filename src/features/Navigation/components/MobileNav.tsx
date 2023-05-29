import * as React from "react";
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper
} from "@mui/material";
import {
    AccountCircle as ProfileIcon,
    EventNote as PlanIcon,
    Logout as LogoutIcon,
    MenuBook as LibraryIcon,
    ShoppingCart as ShopIcon,
} from "@mui/icons-material";


export const MobileNav = () => {
    return (<Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation>
            <BottomNavigationAction label="Library" icon={<LibraryIcon />} />
            <BottomNavigationAction label="Plan" icon={<PlanIcon />} />
            <BottomNavigationAction label="Shop" icon={<ShopIcon />} />
            <BottomNavigationAction label="Profile" icon={<ProfileIcon />} />
            <BottomNavigationAction label="Logout" icon={<LogoutIcon />} />
        </BottomNavigation>
    </Paper>)
}