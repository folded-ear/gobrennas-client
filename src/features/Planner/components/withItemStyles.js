import withStyles from "@material-ui/core/styles/withStyles";
import {
    acquiredColor,
    completeColor,
    deleteColor,
    neededColor,
    questionColor,
    selectionColor,
} from "views/common/colors";

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
        backgroundColor: questionColor[100],
    },
    active: {
        backgroundColor: selectionColor[100],
    },
    selected: {
        backgroundColor: selectionColor[50],
    },
    acquiring: {
        backgroundColor: acquiredColor[50],
    },
    needing: {
        backgroundColor: neededColor[100],
    },
    deleting: {
        opacity: 0.8,
        textDecoration: "line-through",
        backgroundColor: deleteColor[50],
    },
    completing: {
        opacity: 0.8,
        backgroundColor: completeColor[50],
    },
    ancestorDeleting: {
        opacity: 0.6,
        textDecoration: "line-through",
    },
});

export default withItemStyles;
