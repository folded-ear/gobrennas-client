import dispatcher, { ActionType } from "@/data/dispatcher";
import { BfsId } from "@/global/types/identity";
import { GenerateBucketsIcon } from "@/views/common/icons";
import { IconButtonProps } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import * as React from "react";

const ResetBucketsButton: React.FC<{ planId: BfsId } & IconButtonProps> = ({
    planId,
    ...props
}) => (
    <Tooltip title="Reset to this week's buckets" placement="bottom-end">
        <IconButton
            onClick={() =>
                dispatcher.dispatch({
                    type: ActionType.PLAN__RESET_TO_THIS_WEEKS_BUCKETS,
                    planId,
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
