import * as React from 'react';
import { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
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

type NavigationControllerProps = {
    authenticated: boolean,
    children?: ReactNode
}

export const NavigationController: React.FC<NavigationControllerProps> = ({authenticated, children}) => {
    const [expanded, setExpanded] = React.useState<boolean>(true)
    const handleExpand = () => setExpanded(!expanded)
    const isMobile = useIsMobile();
    const devMode = useIsDevMode();

    const getPlans = useFluxStore(
        () => {
            const allPlans = ripLoadObject(planStore.getPlansLO());
            return {allPlans}
        },
        [planStore]
    )
    const {data: navPlanItems, loading, error} = getPlans.allPlans;

    if (!authenticated) {
        return (<MainDesktop>{children}</MainDesktop>)
    }

    if (isMobile) {
        return (<MainMobile>
            <MobileNav/>
            {children}
        </MainMobile>)
    }

    return (
        <FlexBox>
            <CssBaseline/>
            <Header elevation={0}/>
            <DesktopNav
                expanded={expanded}
                handleExpand={handleExpand}
                devMode={devMode}
                planItems={navPlanItems}
            />
            <MainDesktop open={expanded}>
                {children}
            </MainDesktop>
        </FlexBox>
    );
}
