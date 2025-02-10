import { BfsId } from "@/global/types/identity";
import { CookIcon } from "@/views/common/icons";
import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import React from "react";
import { useHistory } from "react-router-dom";

interface Props extends IconButtonProps {
    planId: BfsId;
    itemId: BfsId;
}

const CookButton: React.FC<Props> = ({ planId, itemId, ...props }) => {
    const history = useHistory();
    return (
        <Tooltip title="Cook / Kitchen View" placement="top">
            <IconButton
                onClick={() => history.push(`/plan/${planId}/recipe/${itemId}`)}
                size="large"
                {...props}
            >
                <CookIcon />
            </IconButton>
        </Tooltip>
    );
};

export default CookButton;
