import * as React from "react";
import { BottomNavigation, Paper } from "@mui/material";
import {
    EventNote as PlanIcon,
    MeetingRoom as PantryIcon,
    MenuBook as LibraryIcon,
    ShoppingCart as ShopIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { MobileNavItem } from "features/Navigation/components/MobileNavItem";
import { useProfile } from "../../../providers/Profile";
import User from "../../../views/user/User";

const NavWrapper = styled(Paper)(({ theme }) => ({
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.appBar,
}));

type MobileNavProps = {
    selected?: string;
    devMode?: boolean;
};

export const MobileNav: React.FC<MobileNavProps> = ({
    selected = false,
    devMode = false,
}) => {
    const me = useProfile();
    return (
        <NavWrapper elevation={3}>
            <BottomNavigation showLabels value={selected}>
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
                {devMode && (
                    <MobileNavItem
                        to="/pantry"
                        value="pantry"
                        icon={<PantryIcon />}
                        title="Pantry"
                    />
                )}
                <MobileNavItem
                    title="Profile"
                    icon={<User inline {...me} />}
                    to="/profile"
                    value="profile"
                />
            </BottomNavigation>
        </NavWrapper>
    );
};
