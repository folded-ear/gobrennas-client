import { Box } from "@mui/material";
import * as React from "react";

type FlexBoxProps = {
    children?: React.ReactNode;
};
export const FlexBox: React.FC<FlexBoxProps> = ({ children }) => (
    <Box sx={{ display: "flex" }}>{children}</Box>
);
