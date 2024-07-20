import * as React from "react";
import { ReactNode, useEffect } from "react";
import {
    Header,
    MainDesktop,
    MainMobile,
} from "features/Navigation/components/Navigation.elements";
import { FlexBox } from "global/components/FlexBox";
import useFluxStore from "data/useFluxStore";
import useIsDevMode from "data/useIsDevMode";
import { useIsMobile } from "providers/IsMobile";
import { MobileNav } from "features/Navigation/components/MobileNav";
import { DesktopNav } from "features/Navigation/components/DesktopNav";
import { useHistory } from "react-router-dom";
import { useLogoutHandler } from "providers/Profile";
import RouteStore from "../../data/RouteStore";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import PlanActions from "../Planner/data/PlanActions";
import useIsNavCollapsed, {
    setNavCollapsed,
} from "../../data/useIsNavCollapsed";
import { BfsId } from "../../global/types/identity";

type NavigationControllerProps = {
    authenticated: boolean;
    children?: ReactNode;
};

export function toggleShoppingPlan(id: BfsId) {
    return Dispatcher.dispatch({
        type: ShoppingActions.TOGGLE_PLAN,
        id,
    });
}

export function selectPlan(id: BfsId) {
    return Dispatcher.dispatch({
        type: PlanActions.SELECT_PLAN,
        id,
    });
}

export const NavigationController: React.FC<NavigationControllerProps> = ({
    authenticated,
    children,
}) => {
    const expanded = !useIsNavCollapsed();
    const isMobile = useIsMobile();
    const devMode = useIsDevMode();
    const history = useHistory();
    const [selected, setSelected] = React.useState("");

    const path = useFluxStore(() => {
        const state = RouteStore.getState();
        return state ? state.path : "/library";
    }, [RouteStore]);
    useEffect(() => {
        setSelected(path.split("/")[1]);
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
                <MobileNav selected={selected} devMode={devMode} />
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
                devMode={devMode}
            />
            <MainDesktop open={expanded}>{children}</MainDesktop>
        </FlexBox>
    );
};
