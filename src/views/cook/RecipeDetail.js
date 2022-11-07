import {
    Box,
    CircularProgress,
    Grid,
    Toolbar,
    Typography,
    useScrollTrigger,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PostAdd } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import RecipeApi from "../../data/RecipeApi";
import { Recipe } from "../../data/RecipeTypes";
import useWindowSize from "../../data/useWindowSize";
import history from "../../util/history";
import { loadObjectOf } from "../../util/loadObjectTypes";
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
import SendToPlan from "../SendToPlan";
import User from "../user/User";
import IngredientDirectionsRow from "./IngredientDirectionsRow";
import ShareRecipe from "./ShareRecipe";
import SubrecipeItem from "./SubrecipeItem";

const useStyles = makeStyles(theme => ({
    name: {
        flexGrow: 1,
        [theme.breakpoints.down("xs")]: {
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
        [theme.breakpoints.down("xs")]: {
            flexWrap: "wrap-reverse",
        },
        backgroundColor: "white",
        padding: 0,
    },
}));

const SubHeader = ({children}) => {
    const windowSize = useWindowSize();
    const [height, setHeight] = React.useState("auto");
    const [width, setWidth] = React.useState("auto");
    const inner = React.useRef();
    React.useLayoutEffect(() => {
        setHeight(inner.current.clientHeight);
        setWidth(inner.current.parentNode.clientWidth);
    }, [windowSize.width]);
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
            ref={inner}
            style={trigger ? {
                position: "fixed",
                width,
                // theme.header.height
                top: 75,
                // appbar zindex
                zIndex: 1100,
            } : null}
        >
            {children}
        </Box>
    </div>;
};

SubHeader.propTypes = {
    children: PropTypes.node.isRequired,
};

const RecipeDetail = ({recipeLO, subrecipes, mine, ownerLO, anonymous}) => {

    const classes = useStyles();

    const windowSize = useWindowSize();

    let loggedIn = true;
    if (anonymous) {
        mine = false;
        loggedIn = false;
    }

    const recipe = recipeLO.getValueEnforcing();

    const labelsToDisplay = recipe.labels && recipe.labels
        .filter(label => label.indexOf("--") !== 0);
    return (
        <PageBody hasFab id="toolbar">
            <SubHeader>
                <Toolbar className={classes.toolbar}>
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
                        <ShareRecipe
                            recipe={recipe}
                        />
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
                    {recipe.photo
                        ? <ItemImage className={classes.imageContainer}
                                     recipe={recipe} />
                        : <ItemImageUpload recipe={recipe} disabled={!mine} />}
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

                    {/* todo: this does a store hit for the plan, and only makes sense for a library recipe */}
                    {loggedIn && <Box mt={1}>
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

RecipeDetail.propTypes = {
    recipeLO: loadObjectOf(Recipe).isRequired,
    subrecipes: PropTypes.arrayOf(Recipe),
    anonymous: PropTypes.bool,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object).isRequired,
};

export default RecipeDetail;
