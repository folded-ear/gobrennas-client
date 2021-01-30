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
import RecipeActions from "../../data/RecipeActions";
import { Recipe } from "../../data/RecipeTypes";
import useFluxStore from "../../data/useFluxStore";
import { loadObjectOf } from "../../util/loadObjectTypes";
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
});

const RecipeCard = ({recipe, mine}) => {
    const friendLO = useFluxStore(
        () => mine
            ? null
            : FriendStore.getFriendLO(recipe.ownerId),
        [FriendStore],
        [mine, recipe.ownerId],
    );
    const classes = useStyles();
    const actions = <>
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
    </>;

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
                        recipe={recipe} />
                }
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {recipe.name}
                    </Typography>
                    {recipe.externalUrl && <RecipeInfo label="Source" text={<Source url={recipe.externalUrl}/>}/>}
                    {recipe.yield && <RecipeInfo label="Yield" text={`${recipe.yield} servings`}/>}
                    {recipe.totalTime && <RecipeInfo label="Time" text={recipe.totalTime}/>}
                    {recipe.calories && <RecipeInfo label="Calories" text={recipe.calories}/>}

                    {recipe.labels && recipe.labels
                        .filter(label => label.indexOf("--") !== 0)
                        .map(label =>
                            <LabelItem key={label} label={label}/>)}
                </CardContent>
            </div>
            <CardActions>
                {actions}
            </CardActions>
        </Card>
    );
};

RecipeCard.propTypes = {
    recipe: Recipe,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
    staged: PropTypes.bool,
};

export default RecipeCard;
