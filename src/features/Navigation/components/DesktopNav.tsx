import { useGetAllPlans } from "@/data/hooks/useGetAllPlans";
import useIsDevMode from "@/data/useIsDevMode";
import { Logo } from "@/features/Navigation/components/Logo";
import {
    ItemIcon,
    Navigation,
    Sidebar,
    Subheader,
} from "@/features/Navigation/components/Navigation.elements";
import { NavItem } from "@/features/Navigation/components/NavItem";
import { NavPlanItem } from "@/features/Navigation/components/NavPlanItem";
import { BfsId } from "@/global/types/identity";
import { useProfile } from "@/providers/Profile";
import {
    LibraryIcon,
    LogoutIcon,
    PantryItemAdminIcon,
    PlanIcon,
    ShopIcon,
} from "@/views/common/icons";
import User from "@/views/user/User";
import { Box, List, ListItemButton, Typography } from "@mui/material";
import * as React from "react";
import { NavOwnerItem } from "./NavOwnerItem";
import { NavShopItem } from "./NavShopItem";

type DesktopNavProps = {
    selected: string;
    onProfile: (e: React.SyntheticEvent) => void;
    onLogout: (e: React.SyntheticEvent) => void;
    onOpenPlan: (id: BfsId) => void;
    onSelectPlan: (id: BfsId) => void;
    shopView?: boolean;
    onExpand: () => void;
    expanded?: boolean;
};

export const DesktopNav: React.FC<DesktopNavProps> = ({
    selected,
    onExpand,
    onProfile,
    onLogout,
    onSelectPlan,
    onOpenPlan,
    shopView,
    expanded = false,
}) => {
    const me = useProfile();
    const devMode = useIsDevMode();
    const { data: planItems } = useGetAllPlans();

    const PlanItem = shopView ? NavShopItem : NavPlanItem;
    return (
        <Sidebar open={expanded} variant="permanent">
            <Box sx={{ overflow: "auto", flex: 1 }}>
                <Navigation dense>
                    <Logo expanded={expanded} onClick={onExpand} />
                    <NavItem
                        to="/library"
                        icon={<LibraryIcon />}
                        title="Library"
                        expanded={expanded}
                        selected={selected === "library"}
                    />
                    <NavItem
                        to="/plan"
                        icon={<PlanIcon />}
                        title="Plan"
                        expanded={expanded}
                        selected={selected === "plan"}
                    />
                    <NavItem
                        to="/shop"
                        icon={<ShopIcon />}
                        title="Shop"
                        expanded={expanded}
                        selected={selected === "shop"}
                    />
                    {planItems.map((plan, idx) => {
                        const elements = [
                            <PlanItem
                                key={plan.id}
                                id={plan.id}
                                onIconClick={onSelectPlan}
                                onClick={onOpenPlan}
                                expanded={expanded}
                                name={plan.name}
                                color={plan.color}
                            />,
                        ];
                        if (idx === 0) {
                            elements.unshift(
                                <Subheader key="mine">Plans</Subheader>,
                            );
                        } else if (
                            plan.owner.id !== planItems[idx - 1].owner.id
                        ) {
                            elements.unshift(
                                <NavOwnerItem
                                    key={"owner:" + plan.owner.id}
                                    expanded={expanded}
                                    name={plan.owner.name || "..."}
                                />,
                            );
                        }
                        return elements;
                    })}
                </Navigation>
            </Box>
            <Box sx={{ alignItem: "bottom" }}>
                <List>
                    {devMode && (
                        <NavItem
                            to="/pantry-item-admin"
                            icon={<PantryItemAdminIcon />}
                            title="Pantry Item Admin"
                            expanded={expanded}
                            selected={selected === "pantry-item-admin"}
                        />
                    )}
                    <ListItemButton
                        onClick={onProfile}
                        title={"My Account"}
                        selected={selected === "profile"}
                    >
                        <ItemIcon open={expanded}>
                            <User inline {...me} />
                        </ItemIcon>
                        <Typography noWrap>
                            {expanded ? "My Account" : null}
                        </Typography>
                    </ListItemButton>
                    <ListItemButton onClick={onLogout} title={"Logout"}>
                        <ItemIcon open={expanded}>
                            <LogoutIcon />
                        </ItemIcon>
                        <Typography noWrap>
                            {expanded ? "Logout" : null}
                        </Typography>
                    </ListItemButton>
                </List>
            </Box>
        </Sidebar>
    );
};
