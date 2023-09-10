import {
    IconButton,
    Tooltip,
} from "@mui/material";
import { Kitchen as KitchenIcon } from "@mui/icons-material";
import React from "react";
import history from "util/history";
import { BfsId } from "../../../global/types/types";

interface Props {
    planId: BfsId
    itemId: BfsId
}

const CookButton: React.FC<Props> = ({
                                         planId,
                                         itemId,
                                         ...props
                                     }) => {
    return (
        <Tooltip
            title="Cook / Kitchen View"
            placement="top"
        >
            <IconButton
                onClick={() => history.push(`/plan/${planId}/recipe/${itemId}`)}
                size="large"
                {...props}>
                <KitchenIcon />
            </IconButton>
        </Tooltip>
    );
};

export default CookButton;
