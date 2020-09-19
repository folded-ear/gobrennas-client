import {
    Button,
    IconButton,
    withStyles,
} from "@material-ui/core";

import {
    green as completeColor,
    grey as acquiredColor,
    orange as neededColor,
    red as deleteColor,
} from "@material-ui/core/colors";
import TaskStatus from "../../data/TaskStatus";

export const colorByStatus = {
    [TaskStatus.NEEDED]: neededColor,
    [TaskStatus.ACQUIRED]: acquiredColor,
    [TaskStatus.COMPLETED]: completeColor,
    [TaskStatus.DELETED]: deleteColor,
};

export const coloredIconButton = (palette, restingPalette=palette) =>
    withStyles(theme => ({
        root: {
            color: restingPalette[500],
            "&:hover": {
                color: theme.palette.getContrastText(palette[500]),
                backgroundColor: palette[500],
            },
        },
    }))(IconButton);

export const coloredButton = palette =>
    // this blindly copied from https://v4-5-2.material-ui.com/components/buttons/#customized-buttons
    withStyles(theme => ({
        root: {
            color: theme.palette.getContrastText(palette[500]),
            backgroundColor: palette[500],
            "&:hover": {
                color: theme.palette.getContrastText(palette[700]),
                backgroundColor: palette[700],
            },
        },
    }))(Button);