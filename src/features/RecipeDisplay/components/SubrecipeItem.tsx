import { BreadcrumbLink } from "@/global/components/BreadcrumbLink";
import CollapseIconButton from "@/global/components/CollapseIconButton";
import { IIngredient, Subrecipe } from "@/global/types/types";
import { ScalingProvider } from "@/util/ScalingContext";
import { formatDuration } from "@/util/time";
import {
    Divider,
    Grid,
    Stack,
    Typography,
    TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { useCallback } from "react";
import CookedItButton from "../../Planner/components/CookedItButton";
import IngredientDirectionsRow from "./IngredientDirectionsRow";

const ActiveTypography = styled(Typography)<TypographyProps>({
    cursor: "pointer",
});

interface Props {
    recipe: Subrecipe<IIngredient>;
    loggedIn?: boolean;
}

const SubrecipeItem: React.FC<Props> = ({ recipe, loggedIn }) => {
    const [expanded, setExpanded] = React.useState(false);
    const toggleExpanded = useCallback(() => setExpanded((s) => !s), []);
    return (
        <>
            <Grid item xs={12}>
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <CollapseIconButton
                            expanded={expanded}
                            onClick={toggleExpanded}
                        />
                        <ActiveTypography
                            variant="h5"
                            mb={0}
                            onClick={toggleExpanded}
                        >
                            {recipe.name}
                        </ActiveTypography>
                        {recipe.totalTime && (
                            <ActiveTypography
                                ml={1}
                                variant={"subtitle1"}
                                component={"span"}
                                onClick={toggleExpanded}
                                fontSize={"80%"}
                            >
                                ({formatDuration(recipe.totalTime)})
                            </ActiveTypography>
                        )}
                    </Stack>
                    {expanded && recipe.libraryRecipeId && (
                        <Stack direction={"row"} alignItems={"center"} gap={1}>
                            <CookedItButton recipe={recipe} stayOnPage />
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
