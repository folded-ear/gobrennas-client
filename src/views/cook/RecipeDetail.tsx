import {
    Box,
    CircularProgress,
    Grid,
    Toolbar,
    Typography,
    useScrollTrigger,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { PostAdd } from "@mui/icons-material";
import React, { PropsWithChildren } from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import RecipeApi from "../../data/RecipeApi";
import useWindowSize from "../../data/useWindowSize";
import history from "../../util/history";
import { formatDuration } from "../../util/time";
import CloseButton from "../common/CloseButton";
import CopyButton from "../common/CopyButton";
import DeleteButton from "../common/DeleteButton";
import EditButton from "../common/EditButton";
import FoodingerFab from "../common/FoodingerFab";
import PageBody from "../common/PageBody";
import RecipeInfo from "../common/RecipeInfo";
import Source from "../common/Source";
import LabelItem from "../LabelItem";
import ItemImage from "features/RecipeLibrary/components/ItemImage";
import ItemImageUpload from "features/RecipeLibrary/components/ItemImageUpload";
import User from "../user/User";
import IngredientDirectionsRow from "./IngredientDirectionsRow";
import ShareRecipe from "./ShareRecipe";
import SubrecipeItem from "./SubrecipeItem";
import SendToPlan from "features/RecipeLibrary/components/SendToPlan";
import {
    LoadObject,
    OptionalNumberish,
    Recipe,
    UserType,
} from "global/types/types";
import FavoriteIndicator from "../../features/Favorites/components/Indicator";

const useStyles = makeStyles(theme => ({
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

const SubHeader: React.FC<PropsWithChildren> = ({ children }) => {
    const windowSize = useWindowSize();
    const [ height, setHeight ] = React.useState<OptionalNumberish>("auto");
    const [ width, setWidth ] = React.useState<OptionalNumberish>("auto");
    const inner = React.useRef<HTMLDivElement>();
    React.useLayoutEffect(() => {
        setHeight(inner?.current?.clientHeight);
        setWidth((inner?.current?.parentNode as HTMLElement).clientWidth);
    }, [ windowSize.width ]);
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        // roughly the spacing 2
        threshold: 20,
    });

    return <div
        style={{height}}
    >
        <Box
            boxShadow={trigger ? 6 : 0}
            // @ts-ignore
            ref={inner}
            style={trigger ? {
                position: "fixed",
                width,
                // theme.header.height
                top: 75,
                // appbar zindex
                zIndex: 1100,
            } : undefined}
        >
            {children}
        </Box>
    </div>;
};

function extractRecipePhoto(recipe: any) { // todo: remove
    if (!recipe || !recipe.photo) return null;
    if (typeof recipe.photo === "string") {
        // REST supplied
        return {
            url: recipe.photo,
            focus: recipe.photoFocus,
        };
    } else {
        // GraphQL supplied
        return recipe.photo;
    }
}

interface Props {
    recipeLO: LoadObject<Recipe>
    subrecipes?: Recipe[]
    anonymous?: boolean,
    mine?: boolean,
    ownerLO: LoadObject<UserType>
    canFavorite?: boolean,
    canShare?: boolean,
    canSendToPlan?: boolean,
}

const RecipeDetail: React.FC<Props> = ({
                                           recipeLO,
                                           subrecipes,
                                           mine = false,
                                           ownerLO,
                                           anonymous = false,
                                           canFavorite = false,
                                           canShare = false,
                                           canSendToPlan = false,
                                       }) => {
    const classes = useStyles();

    const windowSize = useWindowSize();

    const loggedIn = !anonymous;
    if (anonymous && mine) {
        // eslint-disable-next-line no-console
        console.warn("Viewer is anonymous, but thinks they own the recipe?!");
        mine = false;
    }

    const recipe = recipeLO.getValueEnforcing();
    const photo = extractRecipePhoto(recipe);

    const labelsToDisplay = recipe.labels && recipe.labels
        .filter(label => label.indexOf("--") !== 0);
    return (
        <PageBody hasFab id="toolbar">
            <SubHeader>
                <Toolbar className={classes.toolbar}>
                    {canFavorite && <FavoriteIndicator type={"Recipe"}
                                                       id={recipe.id} />}
                    <Typography
                        className={classes.name}
                        variant="h2"
                    >
                        {recipe.name}
                        {recipeLO.isLoading() && <Box display="inline" ml={2}>
                            <CircularProgress size={20} />
                        </Box>}
                    </Typography>
                    {loggedIn && <>
                        <CopyButton
                            title={mine ? "Copy" : "Duplicate to My Library"}
                            onClick={() => history.push(`/library/recipe/${recipe.id}/make-copy`)}
                        />
                        {canShare && <ShareRecipe
                            recipe={recipe}
                        />}
                        {mine && <EditButton
                            onClick={() => history.push(`/library/recipe/${recipe.id}/edit`)}
                        />}
                        {mine && <DeleteButton
                            type="recipe"
                            onConfirm={() => RecipeApi.deleteRecipe(recipe.id)}
                        />}
                        <CloseButton
                            onClick={() => history.push("/library")} />
                    </>}
                    {!mine && ownerLO.hasValue() && (loggedIn || windowSize.width > 600) &&
                    <User
                        size={loggedIn ? "small" : "large"}
                        iconOnly
                        {...ownerLO.getValueEnforcing()}
                    />}
                </Toolbar>
            </SubHeader>
            <Grid container spacing={1}>
                <Grid item xs={5}>
                    {photo
                        ? <ItemImage className={classes.imageContainer}
                                     url={photo.url}
                                     focus={photo.focus}
                                     title={recipe.name} />
                        : <ItemImageUpload recipeId={recipe.id}
                                           disabled={!mine} />}
                </Grid>
                <Grid item xs={5}>
                    {recipe.externalUrl && <RecipeInfo
                        label="Source"
                        text={<Source url={recipe.externalUrl} />} />}
                    {recipe.yield && <RecipeInfo
                        label="Yield"
                        text={`${recipe.yield} servings`} />}
                    {recipe.totalTime && <RecipeInfo
                        label="Time"
                        text={formatDuration(recipe.totalTime)} />}
                    {recipe.calories && <RecipeInfo
                        label="Calories"
                        text={`${recipe.calories} per serving`} />}
                    {labelsToDisplay && <Box my={1}>
                        {labelsToDisplay.map(label =>
                            <LabelItem key={label} label={label} />)}
                    </Box>}

                    {loggedIn && canSendToPlan && <Box mt={1}>
                        <SendToPlan
                            onClick={planId => Dispatcher.dispatch({
                                type: RecipeActions.SEND_TO_PLAN,
                                recipeId: recipe.id,
                                planId,
                            })}
                        />
                    </Box>}
                </Grid>

                {subrecipes != null && subrecipes.map(it =>
                    <SubrecipeItem
                        key={it.id}
                        recipe={it}
                        loggedIn={loggedIn}
                    />)}

                <IngredientDirectionsRow
                    recipe={recipe}
                    loggedIn={loggedIn}
                />

            </Grid>
            {loggedIn && <FoodingerFab
                onClick={() => history.push(`/add`)}
            >
                <PostAdd />
            </FoodingerFab>}
        </PageBody>
    );
};

export default RecipeDetail;
