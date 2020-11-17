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
    MenuBook,
} from "@material-ui/icons";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import Dispatcher from "../../data/dispatcher";
import FriendStore from "../../data/FriendStore";
import RecipeActions from "../../data/RecipeActions";
import { Recipe } from "../../data/RecipeTypes";
import UserStore from "../../data/UserStore";
import history from "../../util/history";
import { loadObjectOf } from "../../util/loadObjectTypes";
import CopyButton from "../common/CopyButton";
import Source from "../common/Source";
import LabelItem from "../LabelItem";
import SendToPlan from "../SendToPlan";
import User from "../user/User";
import ItemImage from "./ItemImage";
import ItemImageUpload from "./ItemImageUpload";

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

const RecipeCard = ({recipe, mine, ownerLO}) => {
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
        {mine
            ? <Button
                variant="contained"
                color="secondary"
                disableElevation
                startIcon={<Edit/>}
                to={`/library/recipe/${recipe.id}/edit`}
                component={Link}
            >
                Edit
            </Button>
            : <CopyButton
                mine={mine}
                onClick={() => history.push(`/library/recipe/${recipe.id}/make-copy`)}
            />
        }
        {(!mine && ownerLO.hasValue()) && <User key={"user"}
                                                {...ownerLO.getValueEnforcing()}
                                                iconOnly/>}
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
