import {
    Button,
    IconButton,
    withStyles,
} from "@material-ui/core";

export {
    red as deleteColor,
    green as completeColor,
} from "@material-ui/core/colors";

export const coloredIconButton = palette =>
    withStyles(theme => ({
        root: {
            color: palette[500],
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