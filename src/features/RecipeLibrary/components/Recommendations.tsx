import { useRecommendedRecipes } from "@/features/RecipeLibrary/hooks/useRecommendedRecipes";
import { SectionHeadline } from "@/global/elements/typography.elements";
import { useIsMobile } from "@/providers/IsMobile";
import { useProfile } from "@/providers/Profile";
import { RecipeGrid } from "@/views/recipeCollections/RecipeGrid";
import Button from "@mui/material/Button";

function Recommendations() {
    const isMobile = useIsMobile();
    const me = useProfile();
    const { data: recommended, fetchMore: fetchMoreRecommended } =
        useRecommendedRecipes(isMobile ? 3 : 9);

    if (!recommended?.results || recommended.results.length === 0) {
        return null;
    }

    return (
        <>
            <SectionHeadline>Recommended</SectionHeadline>
            <RecipeGrid
                recipes={recommended.results}
                me={me}
                showOwner={true}
                cardType="nano"
            />
            {recommended?.pageInfo?.hasNextPage && (
                <Button
                    variant="text"
                    onClick={() =>
                        fetchMoreRecommended({
                            variables: {
                                after: recommended?.pageInfo?.endCursor,
                            },
                        })
                    }
                >
                    Show More
                </Button>
            )}
            <SectionHeadline>All Recipes</SectionHeadline>
        </>
    );
}

export default Recommendations;
