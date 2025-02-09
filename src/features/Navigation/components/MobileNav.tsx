import React from "react";
import { BottomNavigation, Paper } from "@mui/material";
import { LibraryIcon, PlanIcon, ShopIcon } from "@/views/common/icons";
import { styled } from "@mui/material/styles";
import { MobileNavItem } from "@/features/Navigation/components/MobileNavItem";
import { useProfile } from "@/providers/Profile";
import User from "@/views/user/User";

const NavWrapper = styled(Paper)(({ theme }) => ({
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.appBar,
}));

type MobileNavProps = {
    selected?: string;
};

export const MobileNav: React.FC<MobileNavProps> = ({ selected = false }) => {
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
