import { deepPurple } from "@mui/material/colors";
import { CheckIcon, DeleteIcon, SumthinsFuckyIcon } from "@/views/common/icons";
import {
    acquiredColor,
    completeColor,
    deleteColor,
    MuiColorFamily,
    neededColor,
} from "@/views/common/colors";
import { PlanItemStatus } from "@/__generated__/graphql";

export const willStatusDelete = (status) =>
    status === PlanItemStatus.Completed || status === PlanItemStatus.Deleted;

const colorByStatus: Record<PlanItemStatus, MuiColorFamily> = {
    [PlanItemStatus.Needed]: neededColor,
    [PlanItemStatus.Acquired]: acquiredColor,
    [PlanItemStatus.Completed]: completeColor,
    [PlanItemStatus.Deleted]: deleteColor,
};

export function getColorForStatus(status: PlanItemStatus): MuiColorFamily {
    return colorByStatus[status] || deepPurple;
}

const iconByStatus: Record<PlanItemStatus, typeof CheckIcon> = {
    [PlanItemStatus.Needed]: CheckIcon,
    [PlanItemStatus.Acquired]: CheckIcon,
    [PlanItemStatus.Completed]: CheckIcon,
    [PlanItemStatus.Deleted]: DeleteIcon,
};
export const getIconForStatus = (status: PlanItemStatus) =>
    iconByStatus[status] || SumthinsFuckyIcon;

export default PlanItemStatus;
