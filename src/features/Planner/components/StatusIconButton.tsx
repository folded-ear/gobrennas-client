import dispatcher, { ActionType } from "@/data/dispatcher";
import PlanItemStatus, {
    getColorForStatus,
    getIconForStatus,
} from "@/features/Planner/data/PlanItemStatus";
import { BfsId } from "@/global/types/identity";
import { coloredButton, coloredIconButton } from "@/views/common/colors";
import { IconButtonProps, Tooltip } from "@mui/material";

const buttonLookup = new Map<
    PlanItemStatus,
    Map<PlanItemStatus, ReturnType<typeof coloredButton>>
>();

function findButton(next: PlanItemStatus, curr: PlanItemStatus) {
    if (!buttonLookup.has(next)) {
        buttonLookup.set(next, new Map());
    }
    // Type assertion is safe due to defaulting above.
    const inner = buttonLookup.get(next)!;
    if (!inner.has(curr)) {
        inner.set(
            curr,
            coloredIconButton(getColorForStatus(next), getColorForStatus(curr)),
        );
    }
    // Type assertion is safe due to defaulting above.
    return inner.get(curr)!;
}

interface Props extends Omit<IconButtonProps, "id" | "color"> {
    next: PlanItemStatus;
    current?: PlanItemStatus;
    id?: BfsId;
}

const StatusIconButton = ({ next, current, id, ...props }: Props) => {
    const Btn = findButton(next, current || next);
    const Icn = getIconForStatus(next);
    return (
        <Tooltip
            title={`Mark ${next.substring(0, 1)}${next
                .substring(1)
                .toLowerCase()}`}
            disableInteractive
            enterDelay={750}
        >
            <Btn
                aria-label={next.toLowerCase()}
                size="small"
                onClick={
                    id && !props.onClick
                        ? (e) => {
                              e.stopPropagation();
                              dispatcher.dispatch({
                                  type: ActionType.PLAN__SET_STATUS,
                                  id,
                                  status: next,
                              });
                          }
                        : undefined
                }
                {...props}
            >
                <Icn />
            </Btn>
        </Tooltip>
    );
};

export default StatusIconButton;
