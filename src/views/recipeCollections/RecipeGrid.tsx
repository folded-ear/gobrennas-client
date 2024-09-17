import { Grid } from "@mui/material";
import RecipeCard from "@/features/RecipeLibrary/components/RecipeCard";
import { NanoCard } from "@/views/recipeCollections/NanoCard";

type RecipeDisplayGridProps = {
    recipes: RecipeCard[];
    me: any; //todo
    markAsMine: boolean;
    cardType: "standard" | "nano";
};

export const RecipeGrid = ({
    recipes,
    me,
    markAsMine,
    cardType = "standard",
}: RecipeDisplayGridProps) => {
    return (
        <Grid container alignItems="stretch">
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
                            me={me}
                            indicateMine={markAsMine}
                            mine={recipe.ownerId === "" + me.id}
                        />
                    ) : (
                        <NanoCard recipe={recipe} isMine={markAsMine} />
                    )}
                </Grid>
            ))}
        </Grid>
    );
};
