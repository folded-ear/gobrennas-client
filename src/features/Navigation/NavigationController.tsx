import * as React from "react";
import { ReactNode, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
    Header,
    MainDesktop,
    MainMobile,
} from "features/Navigation/components/Navigation.elements";
import { FlexBox } from "global/components/FlexBox";
import useFluxStore from "data/useFluxStore";
import { ripLoadObject } from "util/ripLoadObject";
import planStore from "features/Planner/data/planStore";
import useIsDevMode from "data/useIsDevMode";
import { useIsMobile } from "providers/IsMobile";
import { MobileNav } from "features/Navigation/components/MobileNav";
import { DesktopNav } from "features/Navigation/components/DesktopNav";
import { useHistory } from "react-router-dom";
import { useLogoutHandler, useProfileLO } from "providers/Profile";
import RouteStore from "../../data/RouteStore";
import friendStore from "../../data/FriendStore";
import { zippedComparator } from "../../util/comparators";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import useIsNavCollapsed, {
    setNavCollapsed,
} from "../../data/useIsNavCollapsed";

type NavigationControllerProps = {
    authenticated: boolean;
    children?: ReactNode;
};

export const NavigationController: React.FC<NavigationControllerProps> = ({
    authenticated,
    children,
}) => {
    const expanded = !useIsNavCollapsed();
    const isMobile = useIsMobile();
    const devMode = useIsDevMode();
    const profileRLO = ripLoadObject(useProfileLO());
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

    const shopView = selected === "shop";
    const handleSelectPlan = shopView
        ? (id) =>
              Dispatcher.dispatch({
                  type: ShoppingActions.TOGGLE_PLAN,
                  id,
              })
        : (id) => history.push(`/plan/${id}`);

    const getPlans = useFluxStore(
        () => {
            const allPlans = ripLoadObject(
                planStore.getPlansLO().map((plans) => {
                    const myId = profileRLO.data && profileRLO.data.id;
                    const orderComponentsById = plans.reduce((byId, p) => {
                        let ownerId =
                            (p.acl ? p.acl.ownerId : undefined) ||
                            Number.MAX_SAFE_INTEGER;
                        let ownerName = "";
                        if (ownerId === myId) {
                            ownerId = -1;
                        } else {
                            const rlo = ripLoadObject(
                                friendStore.getFriendLO(ownerId),
                            );
                            if (rlo.data) {
                                // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
                                ownerName = rlo.data.name!!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                            }
                        }
                        byId[p.id] = [ownerId, ownerName, p.name.toLowerCase()];
                        return byId;
                    }, {});
                    return plans
                        .slice()
                        .sort((a, b) =>
                            zippedComparator(
                                orderComponentsById[a.id],
                                orderComponentsById[b.id],
                            ),
                        );
                }),
            );
            return { allPlans };
        },
        [planStore, friendStore],
        [profileRLO.data],
    );
    const { data: navPlanItems } = getPlans.allPlans;

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
            <CssBaseline />
            <Header elevation={0} />
            <DesktopNav
                selected={selected}
                expanded={expanded}
                onProfile={handleProfile}
                onLogout={handleLogout}
                shopView={shopView}
                onSelectPlan={handleSelectPlan}
                onExpand={handleExpand}
                devMode={devMode}
                planItems={navPlanItems}
            />
            <MainDesktop open={expanded}>{children}</MainDesktop>
        </FlexBox>
    );
};
