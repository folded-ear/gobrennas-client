import {
    Button,
    Card,
    CardActions,
    CardContent,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Edit,
    MenuBook,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import Dispatcher from "../../data/dispatcher";
import FriendStore from "../../data/FriendStore";
import PreferencesStore from "../../data/PreferencesStore";
import RecipeActions from "../../data/RecipeActions";
import { Recipe } from "../../data/RecipeTypes";
import useFluxStore from "../../data/useFluxStore";
import { loadObjectOf } from "../../util/loadObjectTypes";
import { formatDuration } from "../../util/time";
import RecipeInfo from "../common/RecipeInfo";
import Source from "../common/Source";
import LabelItem from "../LabelItem";
import SendToPlan from "../SendToPlan";
import User from "../user/User";
import ItemImage from "./ItemImage";
import ItemImageUpload from "./ItemImageUpload";

const useStyles = makeStyles({
    photo: {
        height: 140,
    },
    title: {
        textDecoration: "none",
        color: "inherit",
    },
});

const RecipeCard = ({recipe, mine}) => {
    const friendLO = useFluxStore(
        () => mine
            ? null // UserStore.getProfileLO()
            : FriendStore.getFriendLO(recipe.ownerId),
        [FriendStore],
        [mine, recipe.ownerId],
    );
    const devMode = useFluxStore(
        () => PreferencesStore.isDevMode(),
        [PreferencesStore],
        [],
    );
    const classes = useStyles();

    return (
        <Card
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column"
            }}
        >
            <div>
                {recipe.photo
                    ? <Link to={`/library/recipe/${recipe.id}`}>
                        <ItemImage
                            className={classes.photo}
                            recipe={recipe} />
                    </Link>
                    : <ItemImageUpload
                        className={classes.photo}
                        recipe={recipe}
                        disabled={!mine}
                    />
                }
                <CardContent>
                    {devMode && friendLO && friendLO.hasValue() && <div
                        style={{
                            float: "right",
                        }}
                    >
                        <User
                            {...friendLO.getValueEnforcing()}
                            iconOnly
                            inline
                        />
                    </div>}
                    <Typography
                        gutterBottom
                        variant="h5"
                        component={Link}
                        to={`/library/recipe/${recipe.id}`}
                        className={classes.title}
                    >
                        {recipe.name}
                    </Typography>
                    {recipe.externalUrl && <RecipeInfo label="Source" text={<Source url={recipe.externalUrl}/>}/>}
                    {recipe.yield && <RecipeInfo label="Yield" text={`${recipe.yield} servings`}/>}
                    {recipe.totalTime && <RecipeInfo label="Time" text={formatDuration(recipe.totalTime)}/>}
                    {recipe.calories && <RecipeInfo label="Calories" text={recipe.calories}/>}

                    {recipe.labels && recipe.labels
                        .filter(label => label.indexOf("--") !== 0)
                        .map(label =>
                            <LabelItem key={label} label={label}/>)}
                </CardContent>
            </div>
            {!devMode && <CardActions>
                <Button
                    variant="contained"
                    color="secondary"
                    disableElevation
                    startIcon={<MenuBook/>}
                    component={Link}
                    to={`/library/recipe/${recipe.id}`}
                >
                    View
                </Button>
                {mine && <Button
                    variant="contained"
                    color="secondary"
                    disableElevation
                    startIcon={<Edit/>}
                    to={`/library/recipe/${recipe.id}/edit`}
                    component={Link}
                >
                    Edit
                </Button>}
                {friendLO && friendLO.hasValue() && <User
                    {...friendLO.getValueEnforcing()}
                    iconOnly
                />}
                <SendToPlan onClick={planId => Dispatcher.dispatch({
                    type: RecipeActions.SEND_TO_PLAN,
                    recipeId: recipe.id,
                    planId,
                })}/>
            </CardActions>}
        </Card>
    );
};

RecipeCard.propTypes = {
    recipe: Recipe,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
};

export default RecipeCard;
