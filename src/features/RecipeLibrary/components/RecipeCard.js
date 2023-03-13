import {MenuBook,} from "@mui/icons-material";
import {Box, Button, Card, CardActions, CardContent, Grid, Stack, Typography} from "@mui/material";
import {makeStyles} from "@mui/styles";
import Dispatcher from "data/dispatcher";
import FriendStore from "data/FriendStore";
import RecipeActions from "data/RecipeActions";
import {Recipe} from "data/RecipeTypes";
import useFluxStore from "data/useFluxStore";
import ItemImage from "features/RecipeLibrary/components/ItemImage";
import ItemImageUpload from "features/RecipeLibrary/components/ItemImageUpload";
import LabelItem from "features/RecipeLibrary/components/LabelItem";
import SendToPlan from "features/RecipeLibrary/components/SendToPlan";
import PropTypes from "prop-types";
import React from "react";
import {Link} from "react-router-dom";
import {loadObjectOf} from "util/loadObjectTypes";
import {formatDuration} from "util/time";
import RecipeInfo from "views/common/RecipeInfo";
import Source from "views/common/Source";
import User from "views/user/User";
import FavoriteIndicator from "../../Favorites/components/Indicator";

const useStyles = makeStyles({
    photo: {
        height: 140,
    },
    title: {
        textDecoration: "none",
        color: "inherit",
    },
});

const RecipeCard = ({recipe, mine, indicateMine, me}) => {
    const owner = useFluxStore(
        () => {
            if (mine) return indicateMine ? me : null;
            const lo = FriendStore.getFriendLO(recipe.ownerId);
            return lo.hasValue() ? lo.getValueEnforcing() : null;
        },
        [FriendStore],
        [mine, indicateMine, me, recipe.ownerId],
    );
    const classes = useStyles();
    const [raised, setRaised] = React.useState(false);

    const labelsToDisplay = recipe.labels && recipe.labels
        .filter(label => label.indexOf("--") !== 0);
    return (
        <Card
            raised={raised}
            onMouseEnter={() => setRaised(true)}
            onMouseLeave={() => setRaised(false)}
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column"
            }}
        >
            <>
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
                <CardContent style={{ flexGrow: 2 }}>
                    <Grid container alignItems={"center"} wrap={"nowrap"}>
                        <Grid item>
                            <FavoriteIndicator type={"Recipe"}
                                               id={recipe.id} />
                        </Grid>
                        <Grid item style={{ flexGrow: 1 }}>
                            <Typography
                                gutterBottom
                                variant="h5"
                                component={Link}
                                to={`/library/recipe/${recipe.id}`}
                                className={classes.title}
                            >
                                {recipe.name}
                            </Typography>
                        </Grid>
                        <Grid item>
                            {owner && <div
                                style={{
                                    float: "right",
                                }}
                            >
                                <User
                                    {...owner}
                                    iconOnly
                                    inline
                                />
                            </div>}
                        </Grid>
                    </Grid>
                    {recipe.externalUrl && <RecipeInfo label="Source" text={<Source url={recipe.externalUrl} />} />}
                    {recipe.yield && <RecipeInfo label="Yield" text={`${recipe.yield} servings`} />}
                    {recipe.totalTime && <RecipeInfo label="Time" text={formatDuration(recipe.totalTime)} />}
                    {recipe.calories && <RecipeInfo label="Calories" text={recipe.calories} />}

                    {labelsToDisplay && <Box my={0.5}>
                        {labelsToDisplay.map(label =>
                            <LabelItem key={label} label={label} />)}
                    </Box>}
                </CardContent>
            </>
            <CardActions>
                <Stack direction="row" spacing={2}>
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
                <SendToPlan size="small" onClick={planId => Dispatcher.dispatch({
                    type: RecipeActions.SEND_TO_PLAN,
                    recipeId: recipe.id,
                    planId,
                })}/>
                </Stack>
            </CardActions>
        </Card>
    );
};

RecipeCard.propTypes = {
    recipe: Recipe,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
    me: PropTypes.object,
    indicateMine: PropTypes.bool,
};

export default RecipeCard;
