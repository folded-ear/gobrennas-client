import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { formatDuration } from "util/time";
import CollapseIconButton from "global/components/CollapseIconButton";
import IngredientDirectionsRow from "./IngredientDirectionsRow";
import { ScalingProvider } from "util/ScalingContext";
import type { Subrecipe } from "global/types/types";
import { BreadcrumbLink } from "../../../global/components/BreadcrumbLink";
import CookedItButton from "../../Planner/components/CookedItButton";

interface Props {
    recipe: Subrecipe;
    loggedIn?: boolean;
}

const SubrecipeItem: React.FC<Props> = ({ recipe, loggedIn }) => {
    const [expanded, setExpanded] = React.useState(false);
    return (
        <>
            <Grid item xs={12}>
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <Stack direction={"row"} alignItems={"center"}>
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
                            <Box ml={1}>
                                <Typography
                                    variant={"subtitle1"}
                                    component={"span"}
                                    fontSize={"80%"}
                                >
                                    ({formatDuration(recipe.totalTime)})
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                    {expanded && recipe.libraryRecipeId && (
                        <Stack direction={"row"} alignItems={"center"} gap={1}>
                            <CookedItButton recipe={recipe} />
                            <BreadcrumbLink
                                text="Open Library Recipe"
                                url={`/library/recipe/${recipe.libraryRecipeId}`}
                            />
                        </Stack>
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
