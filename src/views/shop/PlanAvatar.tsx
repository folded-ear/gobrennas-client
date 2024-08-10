import { colorHash } from "@/constants/colors";
import Avatar from "@mui/material/Avatar";
import { useMemo } from "react";
import { PlanItem } from "@/features/Planner/data/planStore";

interface Props {
    plan: PlanItem;
}

export default function PlanAvatar({ plan }: Props) {
    const bgcolor = useMemo(() => colorHash(plan.id), [plan.id]);
    return (
        <Avatar
            key={plan.id}
            alt={plan.name}
            title={plan.name}
            sx={{
                bgcolor,
            }}
        >
            {plan.name.substring(0, 2)}
        </Avatar>
    );
}
