import * as React from "react";
import { EditIcon, ViewIcon } from "@/views/common/icons";
import { Box, CardMedia } from "@mui/material";
import Dispatcher from "@/data/dispatcher";
import RecipeActions from "@/data/RecipeActions";
import SendToPlan from "@/features/RecipeLibrary/components/SendToPlan";
import FavoriteIndicator from "../../Favorites/components/Indicator";
import { RecipeType } from "@/features/RecipeLibrary/types";
import {
    NanoCardContent,
    NanoRecipeCard,
} from "@/features/LibrarySearch/components/RecipeDisplay.elements";
import { TaskBar, TaskBarButton } from "@/global/elements/taskbar.elements";
import {
    SmallHeadline,
    SmallLabel,
} from "@/global/elements/typography.elements";
import { Link } from "react-router-dom";

type RecipeListItemProps = {
    recipe: RecipeType;
    mine: boolean;
    markAsMine: boolean;
};

// TODO: add owner indicator?
export const RecipeListItem: React.FC<RecipeListItemProps> = ({
    recipe,
    mine,
}) => {
    const [raised, setRaised] = React.useState(false);
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
        <NanoRecipeCard
            raised={raised}
            onMouseEnter={() => setRaised(true)}
            onMouseLeave={() => setRaised(false)}
        >
            {recipe.photo && recipe.photo.url && (
                <CardMedia
                    component="img"
                    sx={{
                        width: "20%",
                        order: 2,
                        overflow: "hidden",
                    }}
                    image={recipe.photo.url}
                    alt={recipe.name}
                />
            )}
            <NanoCardContent>
                <TaskBar>
                    <FavoriteIndicator type={"Recipe"} id={recipe.id} />
                    <SendToPlan iconOnly onClick={handleClick} />
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
                            <EditIcon />
                        </TaskBarButton>
                    )}
                </TaskBar>
                <SmallHeadline>{recipe.name}</SmallHeadline>
                {labelsToDisplay && (
                    <Box my={0.5}>
                        {labelsToDisplay.map((label, idx) => (
                            <React.Fragment key={label}>
                                <SmallLabel>{label}</SmallLabel>
                                {idx < labelsToDisplay.length - 1 && ", "}
                            </React.Fragment>
                        ))}
                    </Box>
                )}
            </NanoCardContent>
        </NanoRecipeCard>
    );
};
