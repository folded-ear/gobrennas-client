import { EditIcon, ViewIcon } from "@/views/common/icons";
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from "@mui/material";
import Dispatcher from "@/data/dispatcher";
import RecipeActions from "@/data/RecipeActions";
import ItemImage from "@/features/RecipeLibrary/components/ItemImage";
import ItemImageUpload from "@/features/RecipeLibrary/components/ItemImageUpload";
import SendToPlan from "@/features/RecipeLibrary/components/SendToPlan";
import React from "react";
import { Link } from "react-router-dom";
import { formatDuration } from "@/util/time";
import RecipeInfo from "@/views/common/RecipeInfo";
import Source from "@/views/common/Source";
import User from "@/views/user/User";
import FavoriteIndicator from "../../Favorites/components/Indicator";
import LabelItem from "@/global/components/LabelItem";
import { TaskBar, TaskBarButton } from "@/global/elements/taskbar.elements";
import { RecipeCard as TRecipeCard } from "@/features/RecipeLibrary/types";

interface Props {
    recipe: TRecipeCard;
    mine: boolean;
    showOwner: boolean;
}

const RecipeCard: React.FC<Props> = ({ recipe, mine, showOwner }) => {
    const [raised, setRaised] = React.useState(false);

    const labelsToDisplay =
        recipe.labels &&
        recipe.labels.filter((label) => label.indexOf("--") !== 0);

    const handleClick = (planId: number, scale?: number) => {
        Dispatcher.dispatch({
            type: RecipeActions.SEND_TO_PLAN,
            recipeId: recipe.id,
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
                            photo={recipe.photo}
                            alt={recipe.name}
                            sx={{ height: 140 }}
                        />
                    </Link>
                ) : (
                    <ItemImageUpload
                        recipeId={recipe.id}
                        disabled={!mine}
                        notOnPaper
                    />
                )}
                <CardContent style={{ flexGrow: 2 }}>
                    <Grid container alignItems={"start"} wrap={"nowrap"}>
                        <Grid item>
                            <FavoriteIndicator type={"Recipe"} id={recipe.id} />
                        </Grid>
                        <Grid item style={{ flexGrow: 1 }}>
                            <Typography
                                gutterBottom
                                variant="h5"
                                component={Link}
                                to={`/library/recipe/${recipe.id}`}
                                sx={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                {recipe.name}
                            </Typography>
                        </Grid>
                        <Grid item>
                            {showOwner && (
                                <div
                                    style={{
                                        float: "right",
                                    }}
                                >
                                    <User {...recipe.owner} iconOnly inline />
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
                        <RecipeInfo label="Cal." text={recipe.calories} />
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
                <TaskBar>
                    <TaskBarButton
                        component={Link}
                        to={`/library/recipe/${recipe.id}`}
                    >
                        <ViewIcon />
                    </TaskBarButton>
                    {mine && (
                        <TaskBarButton
                            component={Link}
                            to={`/library/recipe/${recipe.id}/edit`}
                        >
                            <EditIcon fontSize="inherit" />
                        </TaskBarButton>
                    )}
                    <SendToPlan onClick={handleClick} showScaleOptions />
                </TaskBar>
            </CardActions>
        </Card>
    );
};

export default RecipeCard;
