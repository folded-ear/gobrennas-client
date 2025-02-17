import RecipeCard from "@/features/RecipeLibrary/components/RecipeCard";
import { RecipeCard as TRecipeCard } from "@/features/RecipeLibrary/types";
import { UserType } from "@/global/types/identity";
import { NanoCard } from "@/views/recipeCollections/NanoCard";
import { Grid } from "@mui/material";
import { PropsWithChildren } from "react";

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
    const isMine = (r: TRecipeCard) => r.owner.id === me.id;
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
