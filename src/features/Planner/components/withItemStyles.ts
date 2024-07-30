import withStyles from "@mui/styles/withStyles";
import {
    acquiredColor,
    completeColor,
    deleteColor,
    neededColor,
    questionColor,
    selectionColor,
} from "views/common/colors";
import { darken, lighten } from "@mui/material";

const withItemStyles = withStyles((theme) => ({
    text: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    section: {
        borderBottomColor:
            theme.palette.mode === "dark"
                ? lighten(theme.palette.neutral.light, 0.5)
                : darken(theme.palette.neutral.main, 0.15),
        "& input": {
            fontWeight: "bold",
        },
        "& .MuiTypography-body1": {
            fontWeight: "bold",
        },
    },
    question: {
        backgroundColor:
            theme.palette.mode === "dark"
                ? darken(questionColor[100], 0.65)
                : questionColor[100],
    },
    active: {
        backgroundColor:
            theme.palette.mode === "dark"
                ? darken(selectionColor[100], 0.6)
                : selectionColor[100],
    },
    selected: {
        backgroundColor:
            theme.palette.mode === "dark"
                ? darken(selectionColor[50], 0.7)
                : selectionColor[50],
    },
    acquiring: {
        backgroundColor:
            theme.palette.mode === "dark"
                ? darken(acquiredColor[100], 0.7)
                : acquiredColor[50],
    },
    needing: {
        backgroundColor:
            theme.palette.mode === "dark" ? neededColor[800] : neededColor[100],
    },
    deleting: {
        opacity: 0.8,
        textDecoration: "line-through",
        backgroundColor:
            theme.palette.mode === "dark"
                ? darken(deleteColor[200], 0.5)
                : deleteColor[50],
    },
    completing: {
        opacity: 0.8,
        backgroundColor:
            theme.palette.mode === "dark"
                ? darken(completeColor[200], 0.6)
                : completeColor[50],
    },
    ancestorDeleting: {
        opacity: 0.6,
        textDecoration: "line-through",
    },
}));

export default withItemStyles;
