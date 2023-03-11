import { TaskStatus } from "./types";
import {
    Check,
    DeleteForeverOutlined,
    QuestionAnswer,
} from "@mui/icons-material";
import {
    deepPurple,
    green,
    grey,
    lightBlue,
    lime,
    red,
    yellow
} from "@mui/material/colors";

export const taskStatusConfig = {
    [TaskStatus.ACQUIRED]: {
        color: lime[50],
        icon: Check,
    },
    [TaskStatus.COMPLETED]: {
        color: green[50],
        icon: Check,
    },
    [TaskStatus.DELETED]: {
        color: red[50],
        icon: DeleteForeverOutlined,
    },
    [TaskStatus.NEEDED]: {
        color: grey[100],
        icon: Check,
    },
    [TaskStatus.OPTIONAL]: {
        color: yellow[100],
        icon: QuestionAnswer,
    },
    [TaskStatus.SELECTED]: {
        color: lightBlue[100],
        icon: Check,
    },
}

export const willStatusDelete = status =>
    status === TaskStatus.COMPLETED || status === TaskStatus.DELETED;

export const getColorForStatus = status =>
    taskStatusConfig[status].color || deepPurple;

export const getIconForStatus = status =>
    taskStatusConfig[status].icon || QuestionAnswer;
