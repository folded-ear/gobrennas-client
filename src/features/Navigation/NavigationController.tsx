import { PropsWithChildren, useEffect, useState } from "react";
import {
    Header,
    MainDesktop,
    MainMobile,
} from "@/features/Navigation/components/Navigation.elements";
import { FlexBox } from "@/global/components/FlexBox";
import { useIsMobile } from "@/providers/IsMobile";
import { MobileNav } from "@/features/Navigation/components/MobileNav";
import { DesktopNav } from "@/features/Navigation/components/DesktopNav";
import { useHistory, useLocation } from "react-router-dom";
import { useIsAuthenticated, useLogoutHandler } from "@/providers/Profile";
import dispatcher, { ActionType } from "@/data/dispatcher";
import useIsNavCollapsed, { setNavCollapsed } from "@/data/useIsNavCollapsed";
import { BfsId, ensureString } from "@/global/types/identity";
import routes from "@/routes";
import SidebarSwitch from "@/SidebarSwitch";
import GTag from "@/GTag";

export function toggleShoppingPlan(id: BfsId) {
    return dispatcher.dispatch({
        type: ActionType.SHOPPING__TOGGLE_PLAN,
        id: ensureString(id),
    });
}

function selectPlan(id: BfsId) {
    return dispatcher.dispatch({
        type: ActionType.PLAN__SELECT_PLAN,
        id,
    });
}

export const NavigationController = ({ children }: PropsWithChildren) => {
    const authenticated = useIsAuthenticated();
    const expanded = !useIsNavCollapsed();
    const isMobile = useIsMobile();
    const history = useHistory();
    const [selected, setSelected] = useState("");
    const path = useLocation().pathname; // e.g., /plan/123

    useEffect(() => {
        setSelected(path.split("/")[1]);
        // BEWARE: strict mode makes it look like the tag is sent twice, because
        // its impure check re-invokes effects. Doesn't happen in production.
        GTag("set", "page_path", path);
        GTag("set", "page_title", path);
        GTag("event", "page_view");
    }, [path]);

    const handleProfile = (e) => {
        e.stopPropagation();
        history.push("/profile");
    };

    const handleExpand = () => setNavCollapsed(expanded);

    const doLogout = useLogoutHandler();

    const handleLogout = (e) => {
        e.preventDefault();
        e.stopPropagation();
        doLogout();
    };

    // This logic is somewhat convoluted. However, the goals are simple:
    // - When viewing the planner, plan items and their icons navigate (switch
    //   between plans).
    // - When viewing the shopping list, plan items and their icons toggle
    //   inclusion of the plan on the list.
    // - Otherwise, plan items open the plan, BUT their icons merely set the
    //   active plan without navigating to it.
    const shopView = selected === "shop";
    const planView = selected === "plan";
    const openPlan = (id) => history.push(`/plan/${id}`);
    const handleSelectPlan = shopView
        ? toggleShoppingPlan
        : planView
        ? openPlan
        : selectPlan;
    const handleOpenPlan = shopView ? toggleShoppingPlan : openPlan;

    if (!authenticated) {
        return isMobile ? (
            <MainMobile>{children}</MainMobile>
        ) : (
            <MainDesktop>{children}</MainDesktop>
        );
    }

    if (isMobile) {
        return (
            <MainMobile>
                <Header elevation={0} />
                <MobileNav selected={selected} />
                {children}
            </MainMobile>
        );
    }

    return (
        <FlexBox>
            <Header elevation={0} />
            <DesktopNav
                selected={selected}
                expanded={expanded}
                onProfile={handleProfile}
                onLogout={handleLogout}
                shopView={shopView}
                onSelectPlan={handleSelectPlan}
                onOpenPlan={handleOpenPlan}
                onExpand={handleExpand}
            />
            <MainDesktop open={expanded}>{children}</MainDesktop>
            <SidebarSwitch routes={routes} />
        </FlexBox>
    );
};
