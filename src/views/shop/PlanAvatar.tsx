import { colorHash } from "@/constants/colors";
import { useMemo } from "react";
import { PlanItem } from "@/features/Planner/data/planStore";
import SizedAvatar, { SizedAvatarProps } from "@/views/SizedAvatar";

interface Props extends Pick<SizedAvatarProps, "inline" | "size"> {
    plan: PlanItem;
    empty?: boolean;
}

export default function PlanAvatar({
    plan,
    empty = false,
    ...passthrough
}: Props) {
    const bgcolor = useMemo(() => colorHash(plan.id), [plan.id]);
    return (
        <SizedAvatar
            alt={plan.name}
            title={plan.name}
            sx={{
                bgcolor,
            }}
            {...passthrough}
        >
            {empty ? <svg /> : plan.name.substring(0, 2)}
        </SizedAvatar>
    );
}
