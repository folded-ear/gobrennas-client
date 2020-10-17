import {
    CircularProgress,
    IconButton,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import grey from "@material-ui/core/colors/grey";
import withStyles from "@material-ui/core/styles/withStyles";
import {
    AddShoppingCart,
    ArrowForward,
} from "@material-ui/icons";
import { Container } from "flux/utils";
import React from "react";
import RecipeStore from "../data/RecipeStore";
import TaskStore from "../data/TaskStore";
import LoadingIconButton from "./common/LoadingIconButton";

const CircProg = withStyles({
    root: {
        color: grey[400],
    },
})(CircularProgress);

export const getCircProg = ({thickness=5, disableShrink=true, ...props}) =>
    <CircProg
        thickness={thickness}
        disableShrink={disableShrink}
        {...props}
    />;

const AddToList = Container.createFunctional(
    ({
         listLO,
         onClick,
         isSending,
         iconOnly,
     }) => {
        if (! listLO.hasValue()) return null;
        const list = listLO.getValueEnforcing();
        if (iconOnly) {
            return isSending
                ? <LoadingIconButton size="small" />
                : <IconButton
                    size="small"
                    onClick={() => onClick(list.id)}
                    title={`Add to "${list.name}"`}
                >
                    <AddShoppingCart fontSize="inherit" />
                </IconButton>;
        }
        return <Button
            variant="outlined"
            size="small"
            disabled={isSending}
            onClick={() => onClick(list.id)}
            endIcon={isSending ? <CircProg
                thickness={5}
                disableShrink
                size={24}
            /> : <ArrowForward />}
        >
            Add to &quot;{list.name}&quot;
        </Button>;
    },
    () => [
        TaskStore,
        RecipeStore,
    ],
    (prevState, props) => {
        const sendState = RecipeStore.getSendState();
        return {
            ...props,
            listLO: TaskStore.getActiveListLO(),
            isSending: sendState != null && !sendState.isDone(),
        };
    },
    {withProps: true},
);

export default AddToList;
