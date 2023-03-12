import {
    Grid,
    Typography
} from "@mui/material";
import PropTypes from "prop-types";
import React from "react";

const RecipeInfo = ({label, text}) => (
    <Grid container>
        <Grid item xs={3}><Typography variant="overline">{label}</Typography></Grid>
        <Grid item xs={9}><Typography variant="subtitle1">{text}</Typography></Grid>
    </Grid>
);

RecipeInfo.propTypes = {
    label: PropTypes.string,
    text: PropTypes.node,
};

export default RecipeInfo;
