import {
    Button,
    IconButton,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
    AddShoppingCart,
    ExitToApp,
} from "@mui/icons-material";
import React from "react";
import useActivePlannerLO from "data/useActivePlannerLO";

const useStyles = makeStyles({
    button: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
});

interface Props {
    onClick: (number) => void
    iconOnly?: boolean
}

const SendToPlan: React.FC<Props> = ({ onClick, iconOnly }) => {
    const classes = useStyles();
    const listLO = useActivePlannerLO();
    if (!listLO.hasValue()) return null;
    const list = listLO.getValueEnforcing();
    const handleClick = () =>
        onClick && onClick(list.id);
    if (iconOnly) {
        return <IconButton
            size="small"
            onClick={handleClick}
            title={`Send to "${list.name}"`}
        >
            <AddShoppingCart fontSize="inherit" />
        </IconButton>;
    } else {
        return <Button
            disableElevation
            variant="contained"
            color="secondary"
            onClick={handleClick}
            startIcon={<ExitToApp />}
        >
            <span
                className={classes.button}
                title={`Send to ${list.name}`}
            >
                To {list.name}
            </span>
        </Button>;
    }
};

export default SendToPlan;
