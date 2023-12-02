import React, { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface MessagePaperProps {
    primary: string;
    children?: ReactNode;
}

export const MessagePaper: React.FC<MessagePaperProps> = ({
    primary,
    children,
}) => {
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
