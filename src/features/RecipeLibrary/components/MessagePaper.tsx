import React, { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface P {
    primary: string;
    children?: never;
}
interface C {
    primary?: never;
    children: ReactNode;
}
type Props = P | C;

export const MessagePaper: React.FC<Props> = ({ primary, children }) => {
    return (
        <Paper
            style={{
                textAlign: "center",
            }}
        >
            <Box p={2} pb={1}>
                {children
                    ? children
                    : primary && (
                          <Typography variant="h5">{primary}</Typography>
                      )}
            </Box>
        </Paper>
    );
};
