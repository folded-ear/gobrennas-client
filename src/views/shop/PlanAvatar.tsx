import { Plan } from "@/features/Planner/data/planStore";
import SizedAvatar, { SizedAvatarProps } from "@/views/SizedAvatar";
import { getContrastRatio, useTheme } from "@mui/material";

interface Props extends Pick<SizedAvatarProps, "inline" | "size"> {
    plan: Plan;
    empty?: boolean;
}

export default function PlanAvatar({
    plan,
    empty = false,
    ...passthrough
}: Props) {
    const theme = useTheme();
    return (
        <SizedAvatar
            alt={plan.name}
            title={plan.name}
            sx={{
                bgcolor: plan.color,
                // This needs a helper. I have NO idea what its name is. Or if
                // this implementation is correct. It works? Ish?
                color:
                    getContrastRatio(plan.color, theme.palette.text.primary) >
                    theme.palette.contrastThreshold
                        ? theme.palette.text.primary
                        : theme.palette.background.default,
            }}
            {...passthrough}
        >
            {empty ? <svg /> : plan.name.substring(0, 2)}
        </SizedAvatar>
    );
}
