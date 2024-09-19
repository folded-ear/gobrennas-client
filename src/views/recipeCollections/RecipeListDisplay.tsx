import { Stack } from "@mui/material";
import { UserType } from "@/global/types/identity";
import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";
import React from "react";
import { RecipeCard } from "@/features/RecipeLibrary/types";
import { NanoCard } from "@/views/recipeCollections/NanoCard";

type RecipeListDisplayProps = {
    recipes?: RecipeCard[];
    me: Pick<UserType, "id">;
    showOwner: boolean;
};

export const RecipeListDisplay: React.FC<RecipeListDisplayProps> = ({
    recipes,
    me,
    showOwner,
}) => {
    if (!recipes) {
        return <MessagePaper primary="Nothing matches that search." />;
    }

    const myId = "" + me.id;
    const isMine = (r) => r.owner.id === myId;

    return (
        <Stack gap={1.5}>
            {recipes.map((recipe) => (
                <NanoCard
                    key={recipe.id}
                    recipe={recipe}
                    mine={isMine(recipe)}
                    showOwner={showOwner}
                />
            ))}
        </Stack>
    );
};
