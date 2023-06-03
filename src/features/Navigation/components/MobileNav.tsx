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
import { styled } from "@mui/material/styles";
import { MobileNavItem } from "features/Navigation/components/MobileNavItem";

const NavWrapper = styled(Paper)(({theme}) => ({
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.appBar
}));

type MobileNavProps = {
    selected: string
    handleProfile: (e: React.SyntheticEvent) => void,
    handleLogout: (e: React.SyntheticEvent) => void,
}

export const MobileNav: React.FC<MobileNavProps> = ({
                                                        selected,
                                                        handleProfile,
                                                    }) => {
    return (
        <NavWrapper elevation={3}>
            <BottomNavigation
                showLabels
                value={selected}
            >
                <MobileNavItem
                    title="Library"
                    icon={<LibraryIcon />}
                    to="/library"
                    value="library"
                />
                <MobileNavItem
                    title="Plan"
                    icon={<PlanIcon />}
                    to="/plan"
                    value="plan"
                />
                <MobileNavItem
                    title="Shop"
                    icon={<ShopIcon />}
                    to="/shop"
                    value="shop"
                />
                <MobileNavItem
                    title="Profile"
                    icon={<ProfileIcon/>}
                    to="/profile"
                    value="profile"
                />
                <BottomNavigationAction
                    label="Logout" icon={<LogoutIcon/>}
                />
            </BottomNavigation>
        </NavWrapper>
    );
};
