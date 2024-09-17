import * as React from "react";
import { EditIcon, ViewIcon } from "@/views/common/icons";
import { Box } from "@mui/material";
import Dispatcher from "@/data/dispatcher";
import RecipeActions from "@/data/RecipeActions";
import SendToPlan from "@/features/RecipeLibrary/components/SendToPlan";
import { RecipeCard } from "@/features/RecipeLibrary/types";
import FavoriteIndicator from "@/features/Favorites/components/Indicator";
import {
    NanoCardContent,
    NanoRecipeCard,
} from "@/views/recipeCollections/RecipeCollection.elements";
import { TaskBar, TaskBarButton } from "@/global/elements/taskbar.elements";
import { LinkTitle, SmallLabel } from "@/global/elements/typography.elements";
import { Link } from "react-router-dom";
import ItemImage from "@/features/RecipeLibrary/components/ItemImage";

type RecipeListItemProps = {
    recipe: RecipeCard;
    isMine: boolean;
};

// TODO: add owner indicator?
export const NanoCard: React.FC<RecipeListItemProps> = ({ recipe, isMine }) => {
    const [raised, setRaised] = React.useState(false);
    const labelsToDisplay =
        recipe.labels &&
        recipe.labels.filter((label) => label.indexOf("--") !== 0);

    const handleClick = (planId: number, scale?: number) => {
        Dispatcher.dispatch({
            type: RecipeActions.SEND_TO_PLAN,
            recipeId:
                typeof recipe.id === "string" ? parseInt(recipe.id) : recipe.id,
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
            {recipe.photo && (
                <ItemImage
                    sx={{
                        width: "20%",
                        order: 2,
                        overflow: "hidden",
                    }}
                    image={recipe.photo}
                    alt={recipe.name}
                    focus={recipe.photoFocus}
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
                    {isMine && (
                        <TaskBarButton
                            component={Link}
                            to={`/library/recipe/${recipe.id}/edit`}
                        >
                            <EditIcon />
                        </TaskBarButton>
                    )}
                </TaskBar>
                <LinkTitle to={`/library/recipe/${recipe.id}`}>
                    {recipe.name}
                </LinkTitle>
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
