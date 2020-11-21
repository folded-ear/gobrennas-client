import {
    CircularProgress,
    Container as Content,
    Grid,
    List,
    ListItem,
    Toolbar,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { Redirect } from "react-router-dom";
import Dispatcher from "../../data/dispatcher";
import LibraryActions from "../../data/LibraryActions";
import RecipeActions from "../../data/RecipeActions";
import RecipeApi from "../../data/RecipeApi";
import { Recipe } from "../../data/RecipeTypes";
import history from "../../util/history";
import { loadObjectOf } from "../../util/loadObjectTypes";
import CloseButton from "../common/CloseButton";
import CopyButton from "../common/CopyButton";
import DeleteButton from "../common/DeleteButton";
import Directions from "../common/Directions";
import EditButton from "../common/EditButton";
import Source from "../common/Source";
import StageButton from "../common/StageButton";
import IngredientItem from "../IngredientItem";
import LabelItem from "../LabelItem";
import ItemImageUpload from "../library/ItemImageUpload";
import SendToPlan from "../SendToPlan";
import User from "../user/User";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: "white",
        minHeight: "100vh",
    },
    name: {
        flexGrow: 1,
        [theme.breakpoints.down("xs")]: {
            width: "100%",
        },
    },
    imageContainer: {
        backgroundPosition: "center",
        backgroundSize: "cover",
        height: "250px",
        overflow: "hidden",
        marginBottom: theme.spacing(4),
        marginRight: theme.spacing(4)
    },
    toolbar: {
        [theme.breakpoints.down("xs")]: {
            flexWrap: "wrap-reverse",
        },
        backgroundColor: "white",
        padding: theme.spacing(4, 0),
    },
}));

const RecipeDetail = ({recipeLO, mine, staged, ownerLO}) => {

    const classes = useStyles();

    if (!recipeLO.hasValue()) {
        if (recipeLO.isLoading()) {
            return <CircularProgress tip="Recipe is loading..."/>;
        }
        return <Redirect to="/library"/>;
    }

    const recipe = recipeLO.getValueEnforcing();

    return (
        <Content className={classes.root} id="toolbar">
            <Grid container>
                <Grid item xs={12}>
                        <Toolbar className={classes.toolbar}>
                            <Typography className={classes.name} component="h1" variant="h3">{recipe.name}</Typography>
                            {mine && (staged
                                    ? <StageButton
                                        staged
                                        onClick={() => Dispatcher.dispatch({
                                            type: LibraryActions.UNSTAGE_RECIPE,
                                            id: recipe.id,
                                        })}/>
                                    : <StageButton
                                        onClick={() => Dispatcher.dispatch({
                                            type: LibraryActions.STAGE_RECIPE,
                                            id: recipe.id,
                                        })}/>
                            )}
                            <CopyButton
                                mine={mine}
                                onClick={() => history.push(`/library/recipe/${recipe.id}/make-copy`)}
                            />
                            {mine && <EditButton
                                onClick={() => history.push(`/library/recipe/${recipe.id}/edit`)}
                            />}
                            {mine && <DeleteButton
                                type="recipe"
                                onConfirm={() => RecipeApi.deleteRecipe(recipe.id)}
                            />}
                            <CloseButton
                                onClick={() => history.push("/library")}/>
                            {!mine && ownerLO.hasValue() && <User
                                size="default"
                                iconOnly
                                {...ownerLO.getValueEnforcing()}
                            />}
                        </Toolbar>
                </Grid>
                <Grid item xs={5}>
                    {recipe.photo
                        ? <div className={classes.imageContainer} style={{backgroundImage: `url(${recipe.photo})`}}/>
                        : <ItemImageUpload recipe={recipe}/>}
                </Grid>
                <Grid item xs={5}>
                    {recipe.externalUrl && <React.Fragment>
                        <Typography variant="h5">Source</Typography>
                        <Source url={recipe.externalUrl}/>
                    </React.Fragment>}

                    {recipe.yield && <React.Fragment>
                        <Typography variant="h5">Yield</Typography>
                        <p>{recipe.yield} servings</p>
                    </React.Fragment>}

                    {recipe.totalTime && <React.Fragment>
                        <Typography variant="h5">Total time</Typography>
                        <p>{recipe.totalTime} minutes</p>
                    </React.Fragment>}

                    {recipe.calories && <React.Fragment>
                        <Typography variant="h5">Calories</Typography>
                        <p>{recipe.calories} calories</p>
                    </React.Fragment>}

                    {recipe.labels && recipe.labels
                        .filter(label => label.indexOf("--") !== 0)
                        .map(label =>
                            <LabelItem key={label} label={label}/>)}

                    <SendToPlan onClick={planId => Dispatcher.dispatch({
                        type: RecipeActions.SEND_TO_PLAN,
                        recipeId: recipe.id,
                        planId,
                    })}/>
                </Grid>

                <Grid item xs={12} md={5}>
                    {recipe.ingredients != null && recipe.ingredients.length > 0 && <>
                        <Typography variant="h5">Ingredients</Typography>
                        <List>
                            {recipe.ingredients && recipe.ingredients.map((it, i) =>
                                <ListItem key={`${i}:${it.raw}`}>
                                    <IngredientItem ingredient={it} />
                                </ListItem>)}
                        </List>
                    </>}
                </Grid>

                <Grid item xs={12} md={7}>
                    {recipe.directions && <React.Fragment>
                        <Typography variant="h5">Directions</Typography>
                        <Directions text={recipe.directions}/>
                    </React.Fragment>}
                </Grid>

            </Grid>
        </Content>
    );
};

RecipeDetail.propTypes = {
    recipeLO: loadObjectOf(Recipe).isRequired,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
    staged: PropTypes.bool,
};

export default RecipeDetail;
