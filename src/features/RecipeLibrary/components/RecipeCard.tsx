import { EditIcon, ViewIcon } from "../../../views/common/icons";
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Dispatcher from "data/dispatcher";
import FriendStore from "data/FriendStore";
import RecipeActions from "data/RecipeActions";
import useFluxStore from "data/useFluxStore";
import ItemImage from "features/RecipeLibrary/components/ItemImage";
import ItemImageUpload from "features/RecipeLibrary/components/ItemImageUpload";
import SendToPlan from "features/RecipeLibrary/components/SendToPlan";
import React from "react";
import { Link } from "react-router-dom";
import { formatDuration } from "util/time";
import RecipeInfo from "views/common/RecipeInfo";
import Source from "views/common/Source";
import User from "views/user/User";
import FavoriteIndicator from "../../Favorites/components/Indicator";
import { Photo, User as UserType } from "../../../__generated__/graphql";
import { TaskIcon } from "global/components/TaskIcon";
import LabelItem from "../../../global/components/LabelItem";
import { useScale } from "util/ScalingContext";

const useStyles = makeStyles({
    photo: {
        height: 140,
    },
    title: {
        textDecoration: "none",
        color: "inherit",
    },
});

export interface RecipeType {
    id: string;
    calories?: number | null;
    directions?: string;
    externalUrl?: string | null;
    favorite: boolean;
    labels?: string[] | null;
    name: string;
    owner: UserType;
    photo?: Photo | null;
    totalTime?: number | null;
    yield?: number | null;
}

interface Props {
    recipe: RecipeType;
    mine: boolean;
    indicateMine: boolean;
    me: any; // todo
}

const RecipeCard: React.FC<Props> = ({ recipe, mine, indicateMine, me }) => {
    const owner = useFluxStore(
        () => {
            if (mine) return indicateMine ? me : null;
            return FriendStore.getFriendRlo(recipe.owner.id).data;
        },
        [FriendStore],
        [mine, indicateMine, me, recipe.owner.id],
    );
    const classes = useStyles();
    const [raised, setRaised] = React.useState(false);
    const scale = useScale();

    const labelsToDisplay =
        recipe.labels &&
        recipe.labels.filter((label) => label.indexOf("--") !== 0);

    const handleClick = (planId: number, scale?: number) => {
        Dispatcher.dispatch({
            type: RecipeActions.SEND_TO_PLAN,
            recipeId: parseInt(recipe.id),
            planId,
            scale: scale ? scale : 1,
        });
    };

    return (
        <Card
            raised={raised}
            onMouseEnter={() => setRaised(true)}
            onMouseLeave={() => setRaised(false)}
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
            }}
        >
            <>
                {recipe.photo ? (
                    <Link to={`/library/recipe/${recipe.id}`}>
                        <ItemImage
                            className={classes.photo}
                            url={recipe.photo.url}
                            focus={recipe.photo.focus}
                            title={recipe.name}
                        />
                    </Link>
                ) : (
                    <ItemImageUpload recipeId={recipe.id} disabled={!mine} />
                )}
                <CardContent style={{ flexGrow: 2 }}>
                    <Grid container alignItems={"center"} wrap={"nowrap"}>
                        <Grid item>
                            <FavoriteIndicator type={"Recipe"} id={recipe.id} />
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
                            {owner && (
                                <div
                                    style={{
                                        float: "right",
                                    }}
                                >
                                    <User {...owner} iconOnly inline />
                                </div>
                            )}
                        </Grid>
                    </Grid>
                    {recipe.externalUrl && (
                        <RecipeInfo
                            label="Source"
                            text={<Source url={recipe.externalUrl} />}
                        />
                    )}
                    {recipe.yield && (
                        <RecipeInfo
                            label="Yield"
                            text={`${recipe.yield} servings`}
                        />
                    )}
                    {recipe.totalTime && (
                        <RecipeInfo
                            label="Time"
                            text={formatDuration(recipe.totalTime)}
                        />
                    )}
                    {recipe.calories && (
                        <RecipeInfo label="Calories" text={recipe.calories} />
                    )}

                    {labelsToDisplay && (
                        <Box my={0.5}>
                            {labelsToDisplay.map((label) => (
                                <LabelItem key={label} label={label} />
                            ))}
                        </Box>
                    )}
                </CardContent>
            </>
            <CardActions>
                <Stack direction="row" spacing={1} sx={{ maxWidth: "100%" }}>
                    <TaskIcon
                        icon={<ViewIcon />}
                        url={`/library/recipe/${recipe.id}`}
                    />
                    {mine && (
                        <TaskIcon
                            icon={<EditIcon />}
                            url={`/library/recipe/${recipe.id}/edit`}
                        />
                    )}
                    <SendToPlan onClick={handleClick} showScaleOptions />
                </Stack>
            </CardActions>
        </Card>
    );
};

export default RecipeCard;
