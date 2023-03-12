import withStyles from "@mui/styles/withStyles";
import { taskStatusConfig } from "../constants";
import { TaskStatus } from "../types";

const withItemStyles = withStyles({
    text: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    section: {
        borderBottomColor: "#ccc",
        "& input": {
            fontWeight: "bold",
        },
        "& .MuiTypography-body1": {
            fontWeight: "bold",
        },
    },
    question: {
        backgroundColor: taskStatusConfig[TaskStatus.OPTIONAL].color,
    },
    active: {
        backgroundColor: taskStatusConfig[TaskStatus.SELECTED].color,
    },
    selected: {
        backgroundColor: taskStatusConfig[TaskStatus.SELECTED].color,
    },
    acquiring: {
        backgroundColor: taskStatusConfig[TaskStatus.ACQUIRED].color,
    },
    needing: {
        backgroundColor: taskStatusConfig[TaskStatus.NEEDED].color,
    },
    deleting: {
        opacity: 0.8,
        textDecoration: "line-through",
        backgroundColor: taskStatusConfig[TaskStatus.DELETED].color,
    },
    completing: {
        opacity: 0.8,
        backgroundColor: taskStatusConfig[TaskStatus.COMPLETED].color,
    },
    ancestorDeleting: {
        opacity: 0.6,
        textDecoration: "line-through",
    },
});

export default withItemStyles;
