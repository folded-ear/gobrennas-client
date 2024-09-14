import {
    ApolloError,
    ObservableQueryFields,
    OperationVariables,
} from "@apollo/client";
import { PageInfo } from "@/__generated__/graphql";

export type UseQueryResult<T, V extends OperationVariables> = {
    loading: boolean;
    error?: ApolloError;
    data: T | null;
    refetch: ObservableQueryFields<T, V>["refetch"];
};

export type Results<T> = {
    results: T[];
    pageInfo: Pick<PageInfo, "hasNextPage">;
} | null;
