import dispatcher, { ActionType } from "@/data/dispatcher";
import useIsDevMode from "@/data/useIsDevMode";
import useWindowSize from "@/data/useWindowSize";
import FavoriteIndicator from "@/features/Favorites/components/Indicator";
import ItemImage from "@/features/RecipeLibrary/components/ItemImage";
import ItemImageUpload from "@/features/RecipeLibrary/components/ItemImageUpload";
import SendToPlan from "@/features/RecipeLibrary/components/SendToPlan";
import { BreadcrumbLink } from "@/global/components/BreadcrumbLink";
import LabelItem from "@/global/components/LabelItem";
import { UserType } from "@/global/types/identity";
import {
    IIngredient,
    Recipe,
    RecipeHistory,
    Subrecipe,
} from "@/global/types/types";
import { ReentrantScalingProvider, useScale } from "@/util/ScalingContext";
import { formatDuration } from "@/util/time";
import FoodingerFab from "@/views/common/FoodingerFab";
import { AddRecipeIcon } from "@/views/common/icons";
import PageBody from "@/views/common/PageBody";
import RecipeInfo from "@/views/common/RecipeInfo";
import Source from "@/views/common/Source";
import User from "@/views/user/User";
import { Box, Grid, Toolbar, Typography } from "@mui/material";
import { Maybe } from "graphql/jsutils/Maybe";
import * as React from "react";
import { useHistory } from "react-router-dom";
import IngredientDirectionsRow from "./IngredientDirectionsRow";
import RecipeHistoryGrid from "./RecipeHistoryGrid";
import { SubHeader } from "./Subheader";
import SubrecipeItem from "./SubrecipeItem";

interface Props<I = IIngredient> {
    recipe: Recipe<I>;
    subrecipes: Maybe<Subrecipe<I>[]>;
    planHistory?: RecipeHistory[];
    anonymous?: boolean;
    mine?: boolean;
    owner?: Pick<UserType, "imageUrl" | "name" | "email">;
    canFavorite?: boolean;
    canShare?: boolean;
    canSendToPlan?: boolean;
    nav?: React.ReactNode;
    showFab?: boolean;
}

const RecipeDetail: React.FC<Props> = ({
    recipe,
    subrecipes,
    planHistory = [],
    mine = false,
    owner,
    anonymous = false,
    canFavorite = false,
    canSendToPlan = false,
    nav,
    showFab = false,
}) => {
    const devMode = useIsDevMode();
    const history = useHistory();

    const windowSize = useWindowSize();
    const scale = useScale();

    const loggedIn = !anonymous;
    if (anonymous && mine) {
        // eslint-disable-next-line no-console
        console.warn("Viewer is anonymous, but thinks they own the recipe?!");
        mine = false;
    }

    const photo = recipe.photo
        ? {
              url: recipe.photo,
              focus: recipe.photoFocus,
          }
        : undefined;

    const labelsToDisplay =
        recipe.labels &&
        recipe.labels.filter((label) => label.indexOf("--") !== 0);
    return (
        <PageBody id="toolbar" className="recipe-detail">
            <SubHeader>
                <Toolbar
                    sx={(theme) => ({
                        flexWrap: ["wrap-reverse", "unset"],
                        backgroundColor: theme.palette.background.paper,
                        padding: 0,
                    })}
                >
                    {canFavorite && (
                        <FavoriteIndicator type={"Recipe"} id={recipe.id} />
                    )}
                    <Typography
                        variant="h2"
                        sx={{
                            flexGrow: 1,
                            width: ["100%", "unset"],
                        }}
                    >
                        {recipe.name}
                        {/*{recipeLO.isLoading() && <Box display="inline" ml={2}>*/}
                        {/*    <CircularProgress size={20} />*/}
                        {/*</Box>}*/}
                    </Typography>
                    {nav}
                    {!mine && owner && (loggedIn || windowSize.width > 600) && (
                        <User
                            size={loggedIn ? "small" : "large"}
                            iconOnly
                            {...owner}
                        />
                    )}
                </Toolbar>
            </SubHeader>
            <Grid container spacing={1}>
                <Grid item xs={5}>
                    {photo ? (
                        <ItemImage
                            photo={photo}
                            alt={recipe.name}
                            sx={{
                                height: "250px",
                                overflow: "hidden",
                                marginBottom: 4,
                                marginRight: 4,
                            }}
                        />
                    ) : (
                        <ItemImageUpload
                            recipeId={recipe.id}
                            disabled={!mine}
                        />
                    )}
                </Grid>
                <Grid item xs={7}>
                    {recipe.externalUrl && (
                        <RecipeInfo
                            label="Source"
                            text={<Source url={recipe.externalUrl} />}
                        />
                    )}
                    {recipe.recipeYield && (
                        <RecipeInfo
                            label="Yield"
                            text={`${recipe.recipeYield} servings`}
                        />
                    )}
                    {recipe.totalTime && (
                        <RecipeInfo
                            label="Time"
                            text={formatDuration(recipe.totalTime)}
                        />
                    )}
                    {recipe.calories && (
                        <RecipeInfo
                            label="Cal."
                            text={`${recipe.calories} per serving`}
                        />
                    )}
                    {labelsToDisplay && (
                        <Box my={1}>
                            {labelsToDisplay.map((label) => (
                                <LabelItem key={label} label={label} />
                            ))}
                        </Box>
                    )}
                    {recipe.libraryRecipeId && (
                        <BreadcrumbLink
                            text="Open Library Recipe"
                            url={`/library/recipe/${recipe.libraryRecipeId}`}
                        />
                    )}

                    {loggedIn && canSendToPlan && (
                        <Box mt={1}>
                            <SendToPlan
                                onClick={(planId) =>
                                    dispatcher.dispatch({
                                        type: ActionType.RECIPE__SEND_TO_PLAN,
                                        recipeId: recipe.id,
                                        planId,
                                        scale,
                                    })
                                }
                            />
                        </Box>
                    )}
                </Grid>

                {subrecipes != null &&
                    subrecipes.map((it) => (
                        <SubrecipeItem
                            key={it.id}
                            recipe={it}
                            loggedIn={loggedIn}
                        />
                    ))}

                <ReentrantScalingProvider>
                    <IngredientDirectionsRow
                        recipe={recipe}
                        loggedIn={loggedIn}
                    />
                </ReentrantScalingProvider>
                {devMode && planHistory && planHistory.length > 0 && (
                    <RecipeHistoryGrid
                        recipeId={recipe.id}
                        history={planHistory}
                    />
                )}
            </Grid>
            {loggedIn && showFab && (
                <FoodingerFab onClick={() => history.push(`/add`)}>
                    <AddRecipeIcon />
                </FoodingerFab>
            )}
        </PageBody>
    );
};

export default RecipeDetail;
