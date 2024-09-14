import { gql } from "@/__generated__";
import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";
import {
    GetRecommendationsQuery,
    SuggestionRequest,
} from "@/__generated__/graphql";
import { Results, UseQueryResult } from "@/data/types";
import { Recipe } from "@/global/types/types";
import { BfsId } from "@/global/types/identity";
import { RecipeCard } from "@/features/RecipeLibrary/types";

const GET_RECOMMENDATIONS_QUERY = gql(`
query getRecommendations($req: SuggestionRequest) {
  library {
    suggestRecipesToCook(req: $req) {
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
      edges {
        cursor
        node {
         ...recipeCard
        }
      }
    }
  }
}
`);

function adapter(
    data: GetRecommendationsQuery | undefined,
): Results<RecipeCard> {
    const result = data?.library?.suggestRecipesToCook || null;
    if (!result) {
        return {
            results: [] as RecipeCard[],
            pageInfo: { hasNextPage: false },
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

export const useRecommendedRecipes = (
    limit: number,
): UseQueryResult<Results<RecipeCard>, { req: SuggestionRequest }> => {
    return useAdaptingQuery(GET_RECOMMENDATIONS_QUERY, adapter, {
        fetchPolicy: "cache-and-network",
        variables: { req: { first: limit, after: null } },
    });
};
