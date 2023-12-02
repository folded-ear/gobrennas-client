import { Box, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CameraAlt, MenuBook } from "@mui/icons-material";
import React, { MouseEventHandler } from "react";

const useStyles = makeStyles({
    trigger: {
        position: "absolute",
        right: 0,
        zIndex: 1000,
        backgroundColor: "white",
        transformOrigin: "bottom right",
        transform: `rotate(90deg) translateY(100%) translateX(50%)`,
    },
});

interface Props {
    onClick: MouseEventHandler;
}

const TextractButton: React.FC<Props> = ({ onClick }) => {
    const classes = useStyles();
    return (
        <Box className={classes.trigger}>
            <Button
                variant={"text"}
                startIcon={<MenuBook />}
                endIcon={<CameraAlt />}
                size={"small"}
                onClick={onClick}
            >
                Cookbook
            </Button>
        </Box>
    );
};

export default TextractButton;
