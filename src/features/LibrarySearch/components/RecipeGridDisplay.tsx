import { Grid } from "@mui/material";
import RecipeCard from "@/features/RecipeLibrary/components/RecipeCard";

type RecipeDisplayGridProps = {
    recipes: any;
    me: any;
    markAsMine: boolean;
};

export const RecipeGridDisplay = ({
    recipes,
    me,
    markAsMine,
}: RecipeDisplayGridProps) => {
    return (
        <Grid container spacing={4} alignItems="stretch">
            {recipes.map((recipe) => (
                <Grid
                    item
                    md={4}
                    sm={6}
                    xs={12}
                    key={recipe.id}
                    sx={{ display: "flex" }}
                >
                    <RecipeCard
                        recipe={recipe}
                        me={me}
                        indicateMine={markAsMine}
                        mine={recipe.owner.id === "" + me.id}
                    />
                </Grid>
            ))}
        </Grid>
    );
};
