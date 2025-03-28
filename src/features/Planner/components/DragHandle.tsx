import { IconButton, IconButtonProps } from "@mui/material";
import { grey } from "@mui/material/colors";
import SvgIcon from "@mui/material/SvgIcon";
import { forwardRef } from "react";

// eslint-disable-next-line react/display-name
const DragHandle = forwardRef<HTMLButtonElement, IconButtonProps>(
    (props, ref) => {
        return (
            <IconButton
                ref={ref}
                size="small"
                style={{
                    color: grey.A400,
                    touchAction: "none",
                }}
                {...props}
            >
                <SvgIcon>
                    <g transform="scale(0.8) translate(5 5)">
                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                    </g>
                </SvgIcon>
            </IconButton>
        );
    },
);

export default DragHandle;
