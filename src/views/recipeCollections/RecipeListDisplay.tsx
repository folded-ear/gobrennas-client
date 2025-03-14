import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";
import { RecipeCard } from "@/features/RecipeLibrary/types";
import { UserType } from "@/global/types/identity";
import { NanoCard } from "@/views/recipeCollections/NanoCard";
import { Stack } from "@mui/material";
import * as React from "react";

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

    const isMine = (r: RecipeCard) => r.owner.id === me.id;

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
