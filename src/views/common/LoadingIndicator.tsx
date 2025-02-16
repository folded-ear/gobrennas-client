import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
    primary?: string;
}

const LoadingIndicator: React.FC<Props> = ({
    primary = "Loading ...",
    children,
}) => {
    return (
        <Paper
            style={{
                textAlign: "center",
                paddingTop: "2em",
                paddingBottom: "1em",
            }}
        >
            <CircularProgress />
            {children
                ? children
                : primary && <Typography component="p">{primary}</Typography>}
        </Paper>
    );
};

export default LoadingIndicator;
