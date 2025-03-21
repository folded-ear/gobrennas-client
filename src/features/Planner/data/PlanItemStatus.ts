import { PlanItemStatus } from "@/__generated__/graphql";
import {
    acquiredColor,
    completeColor,
    deleteColor,
    MuiColorFamily,
    neededColor,
} from "@/views/common/colors";
import { CheckIcon, DeleteIcon, SumthinsFuckyIcon } from "@/views/common/icons";
import { deepPurple } from "@mui/material/colors";

export const willStatusDelete = (status: PlanItemStatus) =>
    status === PlanItemStatus.COMPLETED || status === PlanItemStatus.DELETED;

const colorByStatus: Record<PlanItemStatus, MuiColorFamily> = {
    [PlanItemStatus.NEEDED]: neededColor,
    [PlanItemStatus.ACQUIRED]: acquiredColor,
    [PlanItemStatus.COMPLETED]: completeColor,
    [PlanItemStatus.DELETED]: deleteColor,
};

export function getColorForStatus(status: PlanItemStatus): MuiColorFamily {
    return colorByStatus[status] || deepPurple;
}

const iconByStatus: Record<PlanItemStatus, typeof CheckIcon> = {
    [PlanItemStatus.NEEDED]: CheckIcon,
    [PlanItemStatus.ACQUIRED]: CheckIcon,
    [PlanItemStatus.COMPLETED]: CheckIcon,
    [PlanItemStatus.DELETED]: DeleteIcon,
};
export const getIconForStatus = (status: PlanItemStatus) =>
    iconByStatus[status] || SumthinsFuckyIcon;

export default PlanItemStatus;
