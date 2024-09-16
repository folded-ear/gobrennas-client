import { gql } from "@/__generated__";
import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";
import { Results, UseQueryResult } from "@/data/types";
import { BfsId } from "@/global/types/identity";
import { RecipeCard } from "@/features/RecipeLibrary/types";
import { GetRecipeSuggestionsQuery } from "@/__generated__/graphql";

const GET_RECOMMENDATIONS_QUERY = gql(`
query getRecipeSuggestions(
    $first: NonNegativeInt! = 9
    $after: Cursor = null) {
  library {
    recipes: suggestRecipesToCook(first: $first, after: $after) {
      ...librarySearchResult
    }
  }
}`);

function adapter(
    data: GetRecipeSuggestionsQuery | undefined,
): Results<RecipeCard> {
    const result = data?.library?.recipes || null;
    if (!result) {
        return {
            results: [] as RecipeCard[],
            pageInfo: { hasNextPage: false, endCursor: null },
        };
    }

    const { edges, pageInfo } = result;

    return {
        results: edges.map((it) => {
            const recipe = it.node;
            return {
                calories: recipe?.calories,
                externalUrl: recipe?.externalUrl,
                favorite: recipe?.favorite,
                id: recipe?.id as BfsId,
                labels: recipe?.labels ?? [],
                name: recipe?.name ?? "",
                ownerId: recipe?.owner.id,
                photo: recipe?.photo?.url ?? null,
                photoFocus: recipe?.photo?.focus ?? [],
                recipeYield: recipe?.yield,
                totalTime: recipe?.totalTime,
            };
        }),
        pageInfo,
    };
}

export const useRecommendedRecipes = (limit: number) => {
    return useAdaptingQuery(GET_RECOMMENDATIONS_QUERY, adapter, {
        fetchPolicy: "cache-and-network",
        variables: { first: limit, after: null },
    });
};
