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

const NavWrapper = styled(Paper)({
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
})

type MobileNavProps = {
    handleProfile: (e: React.SyntheticEvent) => void,
    handleLogout: (e: React.SyntheticEvent) => void,
}

export const MobileNav : React.FC<MobileNavProps> = ({handleProfile}) => {
    const [selected, setSelected] = React.useState("library")
    const onChange = (_, newValue) => {
        setSelected(newValue)
    }

    return (
        <NavWrapper>
            <BottomNavigation
                showLabels
                value={selected}
                onChange={onChange}
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
                <BottomNavigationAction
                    label="Profile"
                    icon={<ProfileIcon/>}
                    onClick={handleProfile}
                />
                <BottomNavigationAction
                    label="Logout" icon={<LogoutIcon/>}
                />
            </BottomNavigation>
        </NavWrapper>
    )
}