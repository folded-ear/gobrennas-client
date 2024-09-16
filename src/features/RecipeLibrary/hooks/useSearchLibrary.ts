import {
    SEARCH_RECIPES,
    SUGGEST_RECIPES,
} from "@/features/RecipeLibrary/data/queries";
import { QueryResult, useQuery } from "@apollo/client";
import type { RecipeCard } from "@/features/RecipeLibrary/types";
import useIsDevMode from "@/data/useIsDevMode";
import { LibrarySearchScope } from "@/__generated__/graphql";

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
    const devMode = useIsDevMode();
    // const suggest = !query && scope === LibrarySearchScope.Mine && devMode;
    const { data, error, loading, refetch, fetchMore } = useQuery(
        SEARCH_RECIPES,
        {
            fetchPolicy: "cache-and-network",
            variables: {
                query,
                scope,
            },
        },
    );

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
            photo: it.node.photo?.url || null,
            photoFocus: it.node.photo?.focus || null,
            totalTime: it.node.totalTime || null,
            recipeYield: it.node.yield || null,
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
