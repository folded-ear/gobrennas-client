import { BfsId } from "@/global/types/identity";
import { CookIcon } from "@/views/common/icons";
import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import * as React from "react";
import { useHistory } from "react-router-dom";

interface Props extends IconButtonProps {
    planId: BfsId;
    itemId?: BfsId;
    bucketId?: BfsId;
}

const CookButton: React.FC<Props> = ({
    planId,
    itemId,
    bucketId,
    ...props
}) => {
    const history = useHistory();
    return (
        <Tooltip title="Cook / Kitchen View" placement="top">
            <IconButton
                onClick={() =>
                    history.push(
                        `/plan/${planId}` +
                            (bucketId != null
                                ? `/bucket/${bucketId}`
                                : `/recipe/${itemId}`),
                    )
                }
                size="large"
                {...props}
            >
                <CookIcon />
            </IconButton>
        </Tooltip>
    );
};

export default CookButton;
