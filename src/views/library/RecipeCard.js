import {
    Box,
    Card,
    CardContent,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import FriendStore from "../../data/FriendStore";
import { Recipe } from "../../data/RecipeTypes";
import useFluxStore from "../../data/useFluxStore";
import { loadObjectOf } from "../../util/loadObjectTypes";
import { formatDuration } from "../../util/time";
import RecipeInfo from "../common/RecipeInfo";
import Source from "../common/Source";
import LabelItem from "../LabelItem";
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
                    {friendLO && friendLO.hasValue() && <div
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

                    {labelsToDisplay && <Box my={0.5}>
                        {labelsToDisplay.map(label =>
                            <LabelItem key={label} label={label}/>)}
                    </Box>}
                </CardContent>
            </div>
        </Card>
    );
};

RecipeCard.propTypes = {
    recipe: Recipe,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
};

export default RecipeCard;
