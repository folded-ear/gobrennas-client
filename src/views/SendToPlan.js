import {IconButton} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {AddShoppingCart, ExitToApp,} from "@material-ui/icons";
import {Container} from "flux/utils";
import React from "react";
import TaskStore from "../data/TaskStore";

const SendToPlan = Container.createFunctional(
    ({
         listLO,
         onClick,
         iconOnly,
     }) => {
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
            To {list.name}
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
