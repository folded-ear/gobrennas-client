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
import { LinkTitle } from "@/global/elements/typography.elements";
import { Link } from "react-router-dom";
import ItemImage from "@/features/RecipeLibrary/components/ItemImage";
import { styled } from "@mui/material/styles";
import { BoxProps } from "@mui/material/Box/Box";
import User from "@/views/user/User";

type RecipeListItemProps = {
    recipe: RecipeCard;
    mine: boolean;
    showOwner: boolean;
};

export const NanoCard: React.FC<RecipeListItemProps> = ({
    recipe,
    mine,
    showOwner,
}) => {
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
            title={recipe.name}
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
                    {mine ? (
                        <TaskBarButton
                            component={Link}
                            to={`/library/recipe/${recipe.id}/edit`}
                        >
                            <EditIcon />
                        </TaskBarButton>
                    ) : (
                        showOwner && <User {...recipe.owner} iconOnly inline />
                    )}
                </TaskBar>
                <LinkTitle to={`/library/recipe/${recipe.id}`}>
                    {recipe.name}
                </LinkTitle>
                <Labels mt={0.25} labels={labelsToDisplay} />
            </NanoCardContent>
        </NanoRecipeCard>
    );
};

const Labels: React.FC<BoxProps & { labels: string[] }> = ({
    labels,
    ...passthrough
}: {
    labels: string[];
}) => {
    if (!labels || labels.length === 0) return null;
    return (
        <Lbls title={labels.join(", ")} {...passthrough}>
            {labels.map((label) => (
                <Lbl key={label}>{label}</Lbl>
            ))}
        </Lbls>
    );
};

const Lbls = styled(Box)({
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

const Lbl = styled("span")({
    fontSize: `12px`,
    ":before": {
        content: "', '",
    },
    ":first-of-type:before": {
        content: "''",
    },
});
