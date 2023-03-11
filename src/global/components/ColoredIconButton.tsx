import { withStyles } from "@mui/styles";
import { IconButton } from "@mui/material";

export const coloredIconButton = (color, restingPalette=color) =>
    withStyles(() => ({
        root: {
            color: restingPalette[500],
            "&:hover": {
                color: color[900],
                backgroundColor: color[500],
            },
        },
    }))(IconButton);
