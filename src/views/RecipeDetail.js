import {Affix, List, Spin} from "antd";
import {Grid, Toolbar} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import {Redirect} from "react-router-dom";
import Dispatcher from "../data/dispatcher";
import LibraryActions from "../data/LibraryActions";
import RecipeActions from "../data/RecipeActions";
import RecipeApi from "../data/RecipeApi";
import {Recipe} from "../data/RecipeTypes";
import history from "../util/history";
import loadObjectOf from "../util/loadObjectOf";
import AddToList from "./AddToList";
import DeleteButton from "./common/DeleteButton";
import CopyButton from "./common/CopyButton";
import EditButton from "./common/EditButton";
import CloseButton from "./common/CloseButton";
import Directions from "./common/Directions";
import IngredientItem from "./IngredientItem";
import LabelItem from "./LabelItem";
import User from "./user/User";
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import StageButton from "./common/StageButton";
import Source from "./common/Source";

const useStyles = makeStyles(theme => ({
    root: {},
    name: {
        flexGrow: 1
    },
    image: {
        maxWidth: "90%",
        height: "auto",
        paddingBottom: "2em"
    },
    toolbar: {
        backgroundColor: "white",
        padding: theme.spacing(4, 0),
    },
}));

const RecipeDetail = ({recipeLO, mine, staged, ownerLO}) => {

    const classes = useStyles();

    if (!recipeLO.hasValue()) {
        if (recipeLO.isLoading()) {
            return <Spin tip="Recipe is loading..."/>;
        }
        return <Redirect to="/library"/>;
    }

    const recipe = recipeLO.getValueEnforcing();

    return (
        <div className={classes.root} id="toolbar">
            <Grid container>
                <Grid item xs={12}>
                    <Affix offset={75}>
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
                                mine
                                onClick={() => history.push(`/library/recipe/${recipe.id}/make-copy`)}
                            />
                            {mine && <EditButton
                                onClick={() => history.push(`/library/recipe/${recipe.id}/edit`)}
                            />}
                            <CloseButton
                                onClick={() => history.push("/library")}/>
                            {mine && <DeleteButton
                                type="recipe"
                                onConfirm={() => RecipeApi.deleteRecipe(recipe.id)}
                            />}
                            {!mine && ownerLO.hasValue() && <p style={{float: "right"}}>
                                <User {...ownerLO.getValueEnforcing()} />
                            </p>}

                        </Toolbar>
                    </Affix>
                </Grid>
                <Grid item xs={5}>
                    {recipe.photo && <React.Fragment>
                        <div><img className={classes.image} src={recipe.photo} alt={`${recipe.name}`}/></div>
                    </React.Fragment>}
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
                </Grid>

                <Grid item xs={12} md={5}>
                    {recipe.ingredients != null && recipe.ingredients.length > 0 && <React.Fragment>
                        <Typography variant="h5">Ingredients</Typography>
                        <List
                            dataSource={recipe.ingredients}
                            renderItem={it => <List.Item>
                                <IngredientItem ingredient={it}/>
                            </List.Item>}
                            size="small"
                            split={false}
                            footer={<AddToList onClick={planId => Dispatcher.dispatch({
                                type: RecipeActions.SEND_TO_PLAN,
                                recipeId: recipe.id,
                                planId,
                            })}/>}
                        />
                    </React.Fragment>}
                </Grid>

                <Grid item xs={12} md={7}>
                    {recipe.directions && <React.Fragment>
                        <Typography variant="h5">Directions</Typography>
                        <Directions text={recipe.directions}/>
                    </React.Fragment>}
                </Grid>

            </Grid>


        </div>
    );
};

RecipeDetail.propTypes = {
    recipeLO: loadObjectOf(Recipe).isRequired,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
    staged: PropTypes.bool,
};

export default RecipeDetail;
