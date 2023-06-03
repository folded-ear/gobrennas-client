import * as React from "react";
import {
    ReactNode,
    useEffect
} from "react";
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
import { useLogoutHandler } from "providers/Profile";
import Dispatcher from "data/dispatcher";
import PlanActions from "features/Planner/data/PlanActions";
import RouteStore from "../../data/RouteStore";

type NavigationControllerProps = {
    authenticated: boolean,
    children?: ReactNode
}

export const NavigationController: React.FC<NavigationControllerProps> = ({authenticated, children}) => {
    const [ expanded, setExpanded ] = React.useState<boolean>(true);
    const isMobile = useIsMobile();
    const devMode = useIsDevMode();
    const history = useHistory();
    const [ selected, setSelected ] = React.useState("");

    const path = useFluxStore(() => {
            const state = RouteStore.getState();
            return state ? state.path : "/library";
        },
        [ RouteStore ]);
    useEffect(() => {
        setSelected(path.split("/")[1]);
    }, [ path ]);

    const handleProfile = e => {
        e.stopPropagation();
        history.push("/profile");
    };

    const handleExpand = () => setExpanded(!expanded);

    const doLogout = useLogoutHandler();

    const handleLogout = e => {
        e.preventDefault();
        e.stopPropagation();
        doLogout();
    };

    const handleSelectPlan = id => {
        history.push("/plan");
        Dispatcher.dispatch({
            type: PlanActions.SELECT_PLAN,
            id: id,
        });
    };

    const getPlans = useFluxStore(
        () => {
            const allPlans = ripLoadObject(planStore.getPlansLO());
            return { allPlans };
        },
        [planStore]
    );
    const { data: navPlanItems } = getPlans.allPlans;

    if (!authenticated) {
        return isMobile ? <MainMobile>{children}</MainMobile> : <MainDesktop>{children}</MainDesktop>;
    }

    if (isMobile) {
        return (<MainMobile>
            <Header elevation={0}/>
            <MobileNav
                selected={selected}
            />
            {children}
        </MainMobile>);
    }

    return (
        <FlexBox>
            <CssBaseline/>
            <Header elevation={0}/>
            <DesktopNav
                selected={selected}
                expanded={expanded}
                handleProfile={handleProfile}
                handleLogout={handleLogout}
                handleSelectPlan={handleSelectPlan}
                handleExpand={handleExpand}
                devMode={devMode}
                planItems={navPlanItems}
            />
            <MainDesktop open={expanded}>
                {children}
            </MainDesktop>
        </FlexBox>
    );
};
