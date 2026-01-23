import CollapseIconButton from "@/global/components/CollapseIconButton";
import { IIngredient, Recipe, Section } from "@/global/types/types";
import { ScalingProvider } from "@/util/ScalingContext";
import IngredientName from "@/views/common/IngredientName";
import RecipeLink from "@/views/common/RecipeLink";
import { Divider, Grid, Stack, Typography } from "@mui/material";
import * as React from "react";
import { ReactNode, useCallback } from "react";
import IngredientDirectionsRow from "./IngredientDirectionsRow";

interface Props {
    recipe: Recipe<IIngredient>;
    section: Section<IIngredient>;
    loggedIn?: boolean;
    isLibrary?: boolean;
}

const SectionItem: React.FC<Props> = ({
    recipe,
    section,
    isLibrary,
    loggedIn,
}) => {
    const [expanded, setExpanded] = React.useState(
        !isLibrary || section.sectionOf != null,
    );
    const toggleExpanded = useCallback(() => setExpanded((s) => !s), []);
    let ingredientsAndDirections: ReactNode = null;
    if (expanded) {
        ingredientsAndDirections = (
            <IngredientDirectionsRow
                loggedIn={loggedIn}
                recipe={section}
                hideHeadings
            />
        );
        if (isLibrary && !section.sectionOf) {
            ingredientsAndDirections = (
                <ScalingProvider>{ingredientsAndDirections}</ScalingProvider>
            );
        }
    }
    return (
        <>
            <Grid item xs={12}>
                <Divider flexItem textAlign={"left"}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <CollapseIconButton
                            expanded={expanded}
                            onClick={toggleExpanded}
                        />
                        <Typography
                            variant={"h6"}
                            mb={0}
                            onClick={toggleExpanded}
                            sx={{
                                cursor: "pointer",
                            }}
                        >
                            <IngredientName
                                name={section.name || "Unnamed Section"}
                            />
                            {section.sectionOf &&
                                section.sectionOf.id !== recipe.id && (
                                    <Typography
                                        variant={"body1"}
                                        component={"span"}
                                        sx={{ ml: 1 }}
                                    >
                                        (of{" "}
                                        <IngredientName
                                            name={section.sectionOf.name}
                                        />{" "}
                                        <RecipeLink
                                            recipe={section.sectionOf}
                                        />
                                        )
                                    </Typography>
                                )}
                        </Typography>
                    </Stack>
                </Divider>
            </Grid>
            {ingredientsAndDirections}
        </>
    );
};

export default SectionItem;
