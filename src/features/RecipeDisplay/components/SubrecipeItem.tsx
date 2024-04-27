import { Divider, Grid, Stack, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { formatDuration } from "util/time";
import CollapseIconButton from "global/components/CollapseIconButton";
import IngredientDirectionsRow from "./IngredientDirectionsRow";
import { ScalingProvider } from "util/ScalingContext";
import type { Subrecipe } from "global/types/types";
import { BreadcrumbLink } from "../../../global/components/BreadcrumbLink";

const useStyles = makeStyles({
    time: {
        display: "inline-block",
        fontSize: "80%",
    },
});

interface Props {
    recipe: Subrecipe;
    loggedIn?: boolean;
}

const SubrecipeItem: React.FC<Props> = ({ recipe, loggedIn }) => {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);
    return (
        <>
            <Grid item xs={12}>
                <Stack direction={"row"} gap={1} alignItems={"center"}>
                    <CollapseIconButton
                        expanded={expanded}
                        onClick={() => setExpanded((s) => !s)}
                    />
                    <Typography
                        variant="h5"
                        mb={0}
                        onClick={() => setExpanded((s) => !s)}
                        style={{
                            cursor: "pointer",
                        }}
                    >
                        {recipe.name}
                    </Typography>
                    {recipe.totalTime && (
                        <Typography
                            variant={"subtitle1"}
                            component={"span"}
                            className={classes.time}
                        >
                            ({formatDuration(recipe.totalTime)})
                        </Typography>
                    )}
                    {expanded && recipe.libraryRecipeId && (
                        <BreadcrumbLink
                            text="Open Library Recipe"
                            url={`/library/recipe/${recipe.libraryRecipeId}`}
                        />
                    )}
                </Stack>
            </Grid>
            {expanded && (
                <>
                    {/* Subrecipes do not scale w/ the main recipe */}
                    <ScalingProvider>
                        <IngredientDirectionsRow
                            loggedIn={loggedIn}
                            recipe={recipe}
                            hideHeadings
                        />
                    </ScalingProvider>
                    <Grid item xs={12}>
                        <Divider variant={"middle"} />
                    </Grid>
                </>
            )}
        </>
    );
};

export default SubrecipeItem;
