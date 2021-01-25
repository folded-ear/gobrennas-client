import { IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {
    AddShoppingCart,
    ExitToApp,
} from "@material-ui/icons";
import React from "react";
import TaskStore from "../data/TaskStore";
import useStore from "../data/useStore";

const SendToPlan = ({onClick, iconOnly}) => {
    const listLO = useStore(() => TaskStore.getActiveListLO(), TaskStore, []);
    if (!listLO.hasValue()) return null;
    const list = listLO.getValueEnforcing();
    if (iconOnly) {
        return <IconButton
            size="small"
            onClick={() => onClick(list.id)}
            title={`Send to "${list.name}"`}
        >
            <AddShoppingCart fontSize="inherit" />
        </IconButton>;
    }
    return <Button
        disableElevation
        variant="contained"
        color="secondary"
        onClick={() => onClick(list.id)}
        startIcon={<ExitToApp/>}
    >
        <span
            style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
            title={`Send to ${list.name}`}
        >
            To {list.name}
        </span>
    </Button>;
};

export default SendToPlan;
