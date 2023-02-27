import {
    Button,
    IconButton,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import { deepPurple } from "@mui/material/colors";

export {
    yellow as questionColor,
    lightBlue as selectionColor,
    green as completeColor,
    grey as neededColor,
    lime as acquiredColor,
    red as deleteColor,
} from "@mui/material/colors";

export const coloredIconNoOp = palette =>
    withStyles({
        root: {
            color: palette[600],
            cursor: "not-allowed",
            "&:hover": {
                color: palette[600],
                backgroundColor: "transparent",
            },
        }
    })(IconButton);

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

export const coloredButton = (palette = deepPurple) =>
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