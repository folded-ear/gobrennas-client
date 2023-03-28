import {
    Grid,
    Typography,
} from "@mui/material";
import React, { ReactNode } from "react";

interface Props {
    label: string
    text: ReactNode
}

const RecipeInfo: React.FC<Props> = ({ label, text }) => (
    <Grid container>
        <Grid item xs={3}><Typography variant="overline">{label}</Typography></Grid>
        <Grid item xs={9}><Typography variant="subtitle1">{text}</Typography></Grid>
    </Grid>
);

export default RecipeInfo;
