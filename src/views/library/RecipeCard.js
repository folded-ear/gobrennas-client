import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from "@material-ui/core";
import {
    Edit,
    MenuBook
} from "@material-ui/icons";
import {loadObjectOf} from "../../util/loadObjectTypes";
import {Recipe} from "../../data/RecipeTypes";
import Source from "../common/Source";
import LabelItem from "../LabelItem";
import Dispatcher from "../../data/dispatcher";
import {Link} from "react-router-dom";
import User from "../user/User";
import {Container} from "flux/utils";
import FriendStore from "../../data/FriendStore";
import UserStore from "../../data/UserStore";
import ItemImage from "./ItemImage";
import ItemImageUpload from "./ItemImageUpload";
import RecipeActions from "../../data/RecipeActions";
import SendToPlan from "../SendToPlan";

const RecipeInfo = ({label, text}) => (
    <Grid container>
        <Grid item xs={3}><Typography variant="overline">{label}</Typography></Grid>
        <Grid item xs={9}><Typography variant="subtitle1">{text}</Typography></Grid>
    </Grid>
);

RecipeInfo.propTypes = {
    label: PropTypes.string,
    text: PropTypes.node,
};

const RecipeCard = ({recipe, mine, staged, ownerLO}) => {
    const actions = mine
        ? <>
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
            <Button
                variant="contained"
                color="secondary"
                disableElevation
                startIcon={<Edit/>}
                to={`/library/recipe/${recipe.id}/edit`}
                component={Link}
            >
                Edit
            </Button>
            <SendToPlan onClick={planId => Dispatcher.dispatch({
                type: RecipeActions.SEND_TO_PLAN,
                recipeId: recipe.id,
                planId,
            })}/>
        </>
        : ownerLO.hasValue()
            ? [<User key={"user"}
                     {...ownerLO.getValueEnforcing()}
                     iconOnly/>]
            : null;

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
                    ? <ItemImage recipe={recipe}/>
                    : <ItemImageUpload recipe={recipe}/>
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

export default Container.createFunctional(
    RecipeCard,
    () => [
        FriendStore,
    ],
    (prevState, props) => ({
        ...props,
        ownerLO: props.mine
            ? UserStore.getProfileLO()
            : FriendStore.getFriendLO(props.recipe.ownerId),
    }),
    {withProps: true},
);
