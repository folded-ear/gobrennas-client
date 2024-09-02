import { Box } from "@mui/material";
import { RecipeListItem } from "@/features/LibrarySearch/components/RecipeListItem";
import { UserType } from "@/global/types/identity";
import { MessagePaper } from "@/features/RecipeLibrary/components/MessagePaper";
import React from "react";
import { RecipeType } from "@/features/RecipeLibrary/types";

type RecipeListDisplayProps = {
    recipes?: RecipeType[];
    me: UserType;
    markAsMine: boolean;
};

export const RecipeListDisplay: React.FC<RecipeListDisplayProps> = ({
    recipes,
    me,
    markAsMine,
}) => {
    if (!recipes) {
        return <MessagePaper primary="Nothing matches that search." />;
    }

    return (
        <Box sx={{ display: "flex", gap: `8px`, flexDirection: "column" }}>
            {recipes.map((recipe) => (
                <RecipeListItem
                    key={recipe.id}
                    recipe={recipe}
                    mine={recipe.owner.id === "" + me.id}
                    markAsMine={markAsMine}
                />
            ))}
        </Box>
    );
};
