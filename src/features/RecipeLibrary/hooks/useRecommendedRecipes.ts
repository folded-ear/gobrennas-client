import { gql } from "@/__generated__";
import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";
import { Results } from "@/data/types";
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
        results: edges.map((it) => it.node),
        pageInfo,
    };
}

export const useRecommendedRecipes = (limit: number) => {
    return useAdaptingQuery(GET_RECOMMENDATIONS_QUERY, adapter, {
        fetchPolicy: "cache-and-network",
        variables: { first: limit, after: null },
    });
};
