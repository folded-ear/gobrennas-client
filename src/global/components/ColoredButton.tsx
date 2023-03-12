import { deepPurple } from "@mui/material/colors";
import { withStyles } from "@mui/styles";
import { Button } from "@mui/material";

export const coloredButton = (palette = deepPurple) =>
    // this blindly copied from https://v4-5-2.material-ui.com/components/buttons/#customized-buttons
    withStyles(theme => ({
        root: {
            color: theme.palette.white,
            backgroundColor: palette[500],
            "&:hover": {
                color: theme.palette.white,
                backgroundColor: palette[700],
            },
        },
    }))(Button);