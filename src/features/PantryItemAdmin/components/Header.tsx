import { Grid, Typography } from "@mui/material";
import {
    GridToolbarColumnsButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import React from "react";

export default function Header() {
    return (
        <Grid
            sx={{
                p: 0.5,
            }}
            container
            justifyContent={"space-between"}
            alignItems={"flex-end"}
        >
            <Typography variant={"h3"} component={"h1"}>
                Pantry Item Admin
            </Typography>
            <GridToolbarColumnsButton />
            <GridToolbarQuickFilter />
        </Grid>
    );
}
