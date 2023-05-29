import { Circle as CircleIcon } from "@mui/icons-material";
import * as React from "react";
import { styled } from "@mui/material/styles";
import { FlexBox } from "global/components/FlexBox";

const PlanItemWrapper = styled(FlexBox)(({theme}) =>({
}))

const PlanIcon = styled("div")(({theme}) =>({
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
}))

const PlanNameWrapper = styled("div")(({theme}) =>({
    flex: 1,
    fontSize: ".9em",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    paddingBottom: theme.spacing(1)
}))

type NavPlanItemProps = {
    expanded: boolean,
    name: string,
    color: string,
}

export const NavPlanItem : React.FC<NavPlanItemProps> = ({expanded, name, color}) => {
    return (<PlanItemWrapper>
        <PlanIcon>
            <CircleIcon sx={{ fontSize: 15, color: color }} />
        </PlanIcon>
        <PlanNameWrapper>
            {expanded ? name : null}
        </PlanNameWrapper>
    </PlanItemWrapper>)
}
