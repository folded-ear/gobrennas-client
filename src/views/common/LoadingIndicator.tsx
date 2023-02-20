import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import React from "react";

export default function LoadingIndicator({
    primary = "Loading ...",
    children,
}) {
    return <Paper
        style={{
            textAlign: "center",
            paddingTop: "2em",
            paddingBottom: "1em",
        }}
    >
        <CircularProgress />
        {children
            ? children
            : primary && <Typography component="p">
                {primary}
            </Typography>}
    </Paper>;
}

LoadingIndicator.propTypes = {
    primary: PropTypes.string,
    children: PropTypes.node,
};
