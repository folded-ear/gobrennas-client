import { IconButton } from "@mui/material";
import { AddShoppingCart, ExitToApp as SendIcon } from "@mui/icons-material";
import React from "react";
import useActivePlanner from "data/useActivePlanner";
import TextButton from "../../../views/common/TextButton";

interface Props {
    onClick(planId: number): void;
    iconOnly?: boolean;
}

const SendToPlan: React.FC<Props> = ({ onClick, iconOnly }) => {
    const list = useActivePlanner().data;
    if (!list) return null;
    const handleClick = () =>
        // While items can exist in the store in an unsaved state, plans
        // cannot, so this type assertion is safe.
        onClick && onClick(list.id as number);
    if (iconOnly) {
        return (
            <IconButton
                size="small"
                onClick={handleClick}
                title={`Send to "${list.name}"`}
            >
                <AddShoppingCart fontSize="inherit" />
            </IconButton>
        );
    } else {
        return (
            <TextButton
                disableElevation
                variant="contained"
                color="secondary"
                onClick={handleClick}
                title={`Send to ${list.name}`}
                startIcon={<SendIcon />}
            >
                To {list.name}
            </TextButton>
        );
    }
};

export default SendToPlan;
