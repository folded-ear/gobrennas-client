import { SEARCH_RECIPES } from "@/features/RecipeLibrary/data/queries";
import { QueryResult, useQuery } from "@apollo/client";
import type { RecipeCard } from "@/features/RecipeLibrary/types";
import {
    GetSearchLibraryQuery,
    GetSearchLibraryQueryVariables,
} from "@/__generated__/graphql";

interface UseSearchLibraryQueryResult
    extends Pick<
        QueryResult,
        "loading" | "error" | "refetch" | "fetchMore" | "data"
    > {
    isComplete: boolean;
    endCursor: string;
}

export const useSearchLibrary = ({
    scope,
    query,
}): UseSearchLibraryQueryResult => {
    const { data, error, loading, refetch, fetchMore } = useQuery<
        GetSearchLibraryQuery,
        GetSearchLibraryQueryVariables
    >(SEARCH_RECIPES, {
        fetchPolicy: "cache-and-network",
        variables: {
            query,
            scope,
        },
    });

    // e.node
    const recipes: RecipeCard[] =
        data?.library?.recipes.edges.map((it) => ({
            id: it.node.id,
            name: it.node.name,
            owner: it.node.owner,
            calories: it.node.calories || null,
            externalUrl: it.node.externalUrl || null,
            favorite: it.node.favorite,
            labels: it.node.labels || [],
            photo: it.node.photo || null,
            totalTime: it.node.totalTime || null,
            yield: it.node.yield || null,
        })) || [];

    return {
        loading,
        error,
        refetch,
        fetchMore,
        isComplete: !data?.library?.recipes.pageInfo.hasNextPage,
        endCursor: data?.library?.recipes.pageInfo.endCursor,
        data: recipes,
    };
};
