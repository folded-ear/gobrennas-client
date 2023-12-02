import { deepPurple } from "@mui/material/colors";
import {
    Check,
    DeleteForeverOutlined,
    QuestionAnswer,
} from "@mui/icons-material";
import {
    acquiredColor,
    completeColor,
    deleteColor,
    MuiColorFamily,
    neededColor,
} from "views/common/colors";

enum PlanItemStatus {
    NEEDED = "NEEDED",
    ACQUIRED = "ACQUIRED",
    COMPLETED = "COMPLETED",
    DELETED = "DELETED",
}

export const willStatusDelete = (status) =>
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

const iconByStatus: Record<PlanItemStatus, typeof Check> = {
    [PlanItemStatus.NEEDED]: Check,
    [PlanItemStatus.ACQUIRED]: Check,
    [PlanItemStatus.COMPLETED]: Check,
    [PlanItemStatus.DELETED]: DeleteForeverOutlined,
};
export const getIconForStatus = (status: PlanItemStatus) =>
    iconByStatus[status] || QuestionAnswer;

export default PlanItemStatus;
