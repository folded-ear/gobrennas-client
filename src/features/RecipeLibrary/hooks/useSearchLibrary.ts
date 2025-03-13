import { LibrarySearchScope } from "@/__generated__/graphql";
import { SEARCH_RECIPES } from "@/features/RecipeLibrary/data/queries";
import { QueryResult, useQuery } from "@apollo/client";

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
}: {
    scope: LibrarySearchScope;
    query: string;
}): UseSearchLibraryQueryResult => {
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

    return {
        loading,
        error,
        refetch,
        fetchMore,
        isComplete: !data?.library?.recipes.pageInfo.hasNextPage,
        endCursor: data?.library?.recipes.pageInfo.endCursor,
        data: data?.library?.recipes.edges.map((it) => it.node) || [],
    };
};
