import IconButton from "@mui/material/IconButton";
import dispatcher, { ActionType } from "@/data/dispatcher";
import { GenerateBucketsIcon } from "@/views/common/icons";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { BfsId } from "@/global/types/identity";
import { IconButtonProps } from "@mui/material";

const ResetBucketsButton: React.FC<{ planId: BfsId } & IconButtonProps> = ({
    planId,
    ...props
}) => (
    <Tooltip title="Reset to this week's buckets" placement="bottom-end">
        <IconButton
            onClick={() =>
                dispatcher.dispatch({
                    type: ActionType.PLAN__RESET_TO_THIS_WEEKS_BUCKETS,
                    planId: planId,
                })
            }
            size="small"
            {...props}
        >
            <GenerateBucketsIcon />
        </IconButton>
    </Tooltip>
);
export default ResetBucketsButton;
