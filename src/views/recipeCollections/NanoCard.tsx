import dispatcher, { ActionType } from "@/data/dispatcher";
import FavoriteIndicator from "@/features/Favorites/components/Indicator";
import ItemImage from "@/features/RecipeLibrary/components/ItemImage";
import SendToPlan from "@/features/RecipeLibrary/components/SendToPlan";
import { RecipeCard } from "@/features/RecipeLibrary/types";
import { TaskBar, TaskBarButton } from "@/global/elements/taskbar.elements";
import { LinkTitle } from "@/global/elements/typography.elements";
import { EditIcon, ViewIcon } from "@/views/common/icons";
import {
    NanoCardContent,
    NanoRecipeCard,
} from "@/views/recipeCollections/RecipeCollection.elements";
import User from "@/views/user/User";
import { Box } from "@mui/material";
import { BoxProps } from "@mui/material/Box/Box";
import { styled } from "@mui/material/styles";
import { Maybe } from "graphql/jsutils/Maybe";
import * as React from "react";
import { Link } from "react-router-dom";

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
        dispatcher.dispatch({
            type: ActionType.RECIPE__SEND_TO_PLAN,
            recipeId: recipe.id,
            planId,
            scale,
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
                    photo={recipe.photo}
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

const Labels: React.FC<BoxProps & { labels: Maybe<string[]> }> = ({
    labels,
    ...passthrough
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
