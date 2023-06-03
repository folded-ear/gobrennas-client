import * as React from "react";
import { Box } from "@mui/material";

type FlexBoxProps = {
    children?: React.ReactNode
}
export const FlexBox: React.FC<FlexBoxProps> = ({children}) =>
    (<Box sx={{ display: "flex" }}>{children}</Box>);
