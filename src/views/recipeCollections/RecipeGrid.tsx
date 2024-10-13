import { Grid } from "@mui/material";
import RecipeCard from "@/features/RecipeLibrary/components/RecipeCard";
import { NanoCard } from "@/views/recipeCollections/NanoCard";
import { RecipeCard as TRecipeCard } from "@/features/RecipeLibrary/types";
import { PropsWithChildren } from "react";
import { bfsIdEq, UserType } from "@/global/types/identity";

type RecipeDisplayGridProps = PropsWithChildren & {
    recipes: TRecipeCard[];
    me: Pick<UserType, "id">;
    showOwner: boolean;
    cardType: "standard" | "nano";
    spacing?: number;
};

export const RecipeGrid = ({
    recipes,
    me,
    showOwner,
    cardType = "standard",
    spacing = 2,
    children,
}: RecipeDisplayGridProps) => {
    const isMine = (r) => bfsIdEq(r.owner.id, me.id);
    return (
        <Grid container alignItems="stretch" spacing={spacing}>
            {recipes.map((recipe) => (
                <Grid
                    item
                    md={4}
                    sm={6}
                    xs={12}
                    key={recipe.id}
                    sx={{ display: "flex" }}
                >
                    {cardType === "standard" ? (
                        <RecipeCard
                            recipe={recipe}
                            showOwner={showOwner}
                            mine={isMine(recipe)}
                        />
                    ) : (
                        <NanoCard
                            recipe={recipe}
                            showOwner={showOwner}
                            mine={isMine(recipe)}
                        />
                    )}
                </Grid>
            ))}
            {children}
        </Grid>
    );
};
