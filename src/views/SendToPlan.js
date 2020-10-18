import { IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {
    AddShoppingCart,
    ArrowForward,
} from "@material-ui/icons";
import { Container } from "flux/utils";
import React from "react";
import TaskStore from "../data/TaskStore";

const SendToPlan = Container.createFunctional(
    ({
         listLO,
         onClick,
         iconOnly,
     }) => {
        if (! listLO.hasValue()) return null;
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
            variant="outlined"
            size="small"
            onClick={() => onClick(list.id)}
            endIcon={<ArrowForward />}
        >
            Send to &quot;{list.name}&quot;
        </Button>;
    },
    () => [
        TaskStore,
    ],
    (prevState, props) => {
        return {
            ...props,
            listLO: TaskStore.getActiveListLO(),
        };
    },
    {withProps: true},
);

export default SendToPlan;
