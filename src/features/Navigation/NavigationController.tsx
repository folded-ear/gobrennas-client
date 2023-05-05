import * as React from 'react';
import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {
    EventNote as PlanIcon,
    MeetingRoom as PantryIcon,
    Menu,
    MenuBook as LibraryIcon,
    ShoppingCart as ShopIcon,
    Timer as TimerIcon,
} from "@mui/icons-material";
import {
    IconBtnLight,
    Main,
    Navigation,
    Sidebar,
} from "features/Navigation/components/Navigation.elements";
import { ListSubheader, } from "@mui/material";
import {
    green,
    pink
} from "@mui/material/colors";
import { FlexBox } from "global/components/FlexBox";
import { NavItem } from "features/Navigation/components/NavItem";
import { NavPlanItem } from "features/Navigation/components/NavPlanItem";
import useFluxStore from "data/useFluxStore";
import { ripLoadObject } from "util/ripLoadObject";
import planStore from "features/Planner/data/planStore";

type NavigationControllerProps = {
    authenticated: boolean,
    children?: ReactNode
}

export const NavigationController : React.FC<NavigationControllerProps> = ({authenticated, children}) => {
    const [expanded, setExpanded] = React.useState<boolean>(true)
    const onExpanded = () => setExpanded(!expanded)

    const state = useFluxStore(
        () => {
            const allPlans = ripLoadObject(planStore.getPlansLO());
            return {
                allPlans
            }
        },
        [
            planStore
        ]
    )

    const {data, loading, error } = state.allPlans;

    const navItems = [
        {
            id: "library",
            icon: <LibraryIcon />,
            title: "Library"
        },
        {
            id: "plan",
            icon: <PlanIcon />,
            title: "Plan"
        },
        {
            id: "shop",
            icon: <ShopIcon />,
            title: "Shop"
        },
        {
            id: "pantry",
            icon: <PantryIcon />,
            title: "Pantry"
        },
    ]

    return (
        <FlexBox>
            <CssBaseline/>
            <Sidebar
                open={expanded}
                variant="permanent"
            >
                <IconBtnLight onClick={onExpanded}>
                    <Menu/>
                </IconBtnLight>
                <Typography variant="h6" noWrap component="div">
                    {expanded ? "Food Software" : "BFS"}
                </Typography>
                <Box sx={{overflow: 'auto'}}>
                    <Navigation dense>
                        {navItems.map(item => (
                            <NavItem
                                to={`/${item.id}`}
                                value={item.id}
                                icon={item.icon}
                                title={item.title}
                            />
                        ))}
                        <NavItem
                            to="/timers"
                            value="timers"
                            icon={<TimerIcon/>}
                            title="Timers"
                        />
                    </Navigation>
                    <Divider/>
                    <ListSubheader component="div" id="nested-list-subheader">
                        Plans
                    </ListSubheader>
                    <Navigation>
                        <NavPlanItem name="This Week" color={pink[500]} />
                        <NavPlanItem name="Thanksgiving" color={green[500]} />
                    </Navigation>
                </Box>
            </Sidebar>
            <Main open={expanded}>
                {children}
            </Main>
        </FlexBox>
    );
}
