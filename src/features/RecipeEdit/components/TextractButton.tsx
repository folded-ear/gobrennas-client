import { LibraryIcon, TextractIcon } from "@/views/common/icons";
import { Box, Button, ButtonProps } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import * as React from "react";

const useStyles = makeStyles((theme: Theme) => ({
    trigger: {
        position: "absolute",
        right: 0,
        zIndex: theme.zIndex.drawer - 1,
        backgroundColor: theme.palette.background.paper,
        transformOrigin: "bottom right",
        transform: `rotate(90deg) translateY(100%) translateX(50%)`,
    },
}));

interface Props {
    onClick: ButtonProps["onClick"];
}

const TextractButton: React.FC<Props> = ({ onClick }) => {
    const classes = useStyles();
    return (
        <Box className={classes.trigger}>
            <Button
                variant={"text"}
                startIcon={<LibraryIcon />}
                endIcon={<TextractIcon />}
                size={"small"}
                onClick={onClick}
            >
                Cookbook
            </Button>
        </Box>
    );
};

export default TextractButton;
