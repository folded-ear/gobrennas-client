import { withStyles } from "@mui/styles";
import { IconButton } from "@mui/material";

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
