import {
    Box,
    Grid,
    Table,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
    AddRecipeIcon,
    CookedItIcon,
    DeleteIcon,
} from "../../../views/common/icons";
import React from "react";
import Dispatcher from "data/dispatcher";
import RecipeActions from "data/RecipeActions";
import useWindowSize from "data/useWindowSize";
import history from "util/history";
import { formatDuration } from "util/time";
import FoodingerFab from "views/common/FoodingerFab";
import PageBody from "views/common/PageBody";
import RecipeInfo from "views/common/RecipeInfo";
import Source from "views/common/Source";
import LabelItem from "global/components/LabelItem";
import ItemImage from "features/RecipeLibrary/components/ItemImage";
import ItemImageUpload from "features/RecipeLibrary/components/ItemImageUpload";
import User from "views/user/User";
import IngredientDirectionsRow from "./IngredientDirectionsRow";
import SubrecipeItem from "./SubrecipeItem";
import SendToPlan from "features/RecipeLibrary/components/SendToPlan";
import { UserType } from "global/types/identity";
import type { Recipe, RecipeHistory, Subrecipe } from "global/types/types";
import FavoriteIndicator from "features/Favorites/components/Indicator";
import { ReentrantScalingProvider, useScale } from "util/ScalingContext";
import { SubHeader } from "./Subheader";
import { extractRecipePhoto } from "features/RecipeDisplay/utils/extractRecipePhoto";
import { BreadcrumbLink } from "global/components/BreadcrumbLink";
import { PlanItemStatus } from "../../../__generated__/graphql";
import TableCell from "@mui/material/TableCell";
import useIsDevMode from "../../../data/useIsDevMode";

const useStyles = makeStyles((theme) => ({
    name: {
        flexGrow: 1,
        [theme.breakpoints.down("sm")]: {
            width: "100%",
        },
    },
    imageContainer: {
        height: "250px",
        overflow: "hidden",
        marginBottom: theme.spacing(4),
        marginRight: theme.spacing(4),
    },
    toolbar: {
        [theme.breakpoints.down("sm")]: {
            flexWrap: "wrap-reverse",
        },
        backgroundColor: "white",
        padding: 0,
    },
}));

interface Props {
    recipe: Recipe;
    subrecipes: Subrecipe[];
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
    const classes = useStyles();
    const devMode = useIsDevMode();

    const windowSize = useWindowSize();
    const scale = useScale();

    const loggedIn = !anonymous;
    if (anonymous && mine) {
        // eslint-disable-next-line no-console
        console.warn("Viewer is anonymous, but thinks they own the recipe?!");
        mine = false;
    }
    const hasFab = loggedIn && showFab;

    const photo = extractRecipePhoto(recipe);

    const labelsToDisplay =
        recipe.labels &&
        recipe.labels.filter((label) => label.indexOf("--") !== 0);
    return (
        <PageBody hasFab={hasFab} id="toolbar">
            <SubHeader>
                <Toolbar className={classes.toolbar}>
                    {canFavorite && (
                        <FavoriteIndicator type={"Recipe"} id={recipe.id} />
                    )}
                    <Typography className={classes.name} variant="h2">
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
                            className={classes.imageContainer}
                            url={photo.url}
                            focus={photo.focus}
                            title={recipe.name}
                        />
                    ) : (
                        <ItemImageUpload
                            recipeId={recipe.id}
                            disabled={!mine}
                        />
                    )}
                </Grid>
                <Grid item xs={5}>
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
                            label="Calories"
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
                                    Dispatcher.dispatch({
                                        type: RecipeActions.SEND_TO_PLAN,
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
                    <Grid item xs={12}>
                        <Typography variant="h5">History</Typography>
                        <Table size={"small"}>
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Planned</TableCell>
                                    <TableCell>Done</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell />
                                    <TableCell>ID</TableCell>
                                </TableRow>
                            </TableHead>
                            {planHistory.map((h) => (
                                <TableRow key={h.id}>
                                    <TableCell>
                                        {PlanItemStatus.Completed ===
                                        h.status ? (
                                            <CookedItIcon />
                                        ) : (
                                            <DeleteIcon />
                                        )}
                                    </TableCell>
                                    <TableCell>{h.plannedDate}</TableCell>
                                    <TableCell>{h.doneDate}</TableCell>
                                    <TableCell>
                                        {h.rating ||
                                            Math.ceil(Math.random() * 5)}{" "}
                                        out of 5
                                    </TableCell>
                                    <TableCell>
                                        {h.notes ||
                                        PlanItemStatus.Completed === h.status
                                            ? `${h.owner.name} is the quiet type.`
                                            : `${h.owner.name} HATES this recipe.`}
                                    </TableCell>
                                    <TableCell>
                                        <User {...h.owner} iconOnly />
                                    </TableCell>
                                    <TableCell>{h.id}</TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </Grid>
                )}
            </Grid>
            {hasFab && (
                <FoodingerFab onClick={() => history.push(`/add`)}>
                    <AddRecipeIcon />
                </FoodingerFab>
            )}
        </PageBody>
    );
};

export default RecipeDetail;
