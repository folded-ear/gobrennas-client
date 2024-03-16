import * as React from "react";
import {
    ItemIcon,
    Navigation,
    Sidebar,
    Subheader,
} from "features/Navigation/components/Navigation.elements";
import { Logo } from "features/Navigation/components/Logo";
import { NavItem } from "features/Navigation/components/NavItem";
import {
    EventNote as PlanIcon,
    Logout as LogoutIcon,
    MeetingRoom as PantryIcon,
    MenuBook as LibraryIcon,
    ShoppingCart as ShopIcon,
} from "@mui/icons-material";
import { Box, List, ListItemButton, Typography } from "@mui/material";
import { NavPlanItem } from "features/Navigation/components/NavPlanItem";
import { colorHash } from "constants/colors";
import { NavOwnerItem } from "./NavOwnerItem";
import User from "views/user/User";
import { useProfile } from "providers/Profile";
import { NavShopItem } from "./NavShopItem";
import { BfsId } from "global/types/identity";
import useAllPlansRLO from "../../../data/useAllPlansRLO";

type DesktopNavProps = {
    selected: string;
    onProfile: (e: React.SyntheticEvent) => void;
    onLogout: (e: React.SyntheticEvent) => void;
    onOpenPlan: (id: BfsId) => void;
    onSelectPlan: (id: BfsId) => void;
    shopView?: boolean;
    onExpand: () => void;
    expanded?: boolean;
    devMode?: boolean;
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
    devMode = false,
}) => {
    const me = useProfile();
    const planItems = useAllPlansRLO().data;
    const PlanItem = shopView ? NavShopItem : NavPlanItem;
    return (
        <>
            <Sidebar open={expanded} variant="permanent">
                <Box sx={{ overflow: "auto", flex: 1 }}>
                    <Navigation dense>
                        <Logo expanded={expanded} onClick={onExpand} />
                        <NavItem
                            to="/library"
                            value="library"
                            icon={<LibraryIcon />}
                            title="Library"
                            expanded={expanded}
                            selected={selected === "library"}
                        />
                        <NavItem
                            to="/plan"
                            value="plan"
                            icon={<PlanIcon />}
                            title="Plan"
                            expanded={expanded}
                            selected={selected === "plan"}
                        />
                        <NavItem
                            to="/shop"
                            value="shop"
                            icon={<ShopIcon />}
                            title="Shop"
                            expanded={expanded}
                            selected={selected === "shop"}
                        />
                        {devMode && (
                            <NavItem
                                to="/pantry"
                                value="pantry"
                                icon={<PantryIcon />}
                                title="Pantry"
                                expanded={expanded}
                                selected={selected === "pantry"}
                            />
                        )}
                        {/*<NavItem*/}
                        {/*    to="/timers"*/}
                        {/*    value="timers"*/}
                        {/*    icon={<TimerIcon/>}*/}
                        {/*    title="Timers"*/}
                        {/*    expanded={expanded}*/}
                        {/*/>*/}
                        {planItems &&
                            planItems.map((item, i) => {
                                const elements = [
                                    <PlanItem
                                        key={item.id}
                                        id={item.id}
                                        onIconClick={onSelectPlan}
                                        onClick={onOpenPlan}
                                        expanded={expanded}
                                        name={item.name}
                                        color={colorHash(item.id)}
                                    />,
                                ];
                                if (i === 0) {
                                    elements.unshift(
                                        <Subheader key={-item.id}>
                                            Plans
                                        </Subheader>,
                                    );
                                } else if (
                                    item.acl.ownerId !==
                                    planItems[i - 1].acl.ownerId
                                ) {
                                    elements.unshift(
                                        <NavOwnerItem
                                            key={-item.id}
                                            expanded={expanded}
                                            id={item.acl.ownerId}
                                        />,
                                    );
                                }
                                return elements;
                            })}
                    </Navigation>
                </Box>
                <Box sx={{ alignItem: "bottom" }}>
                    <List>
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
        </>
    );
};
