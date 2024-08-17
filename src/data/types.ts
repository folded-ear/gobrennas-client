import {
    ApolloError,
    ObservableQueryFields,
    OperationVariables,
} from "@apollo/client";

export type UseQueryResult<T, V extends OperationVariables> = {
    loading: boolean;
    error?: ApolloError;
    data: T | null;
    refetch: ObservableQueryFields<T, V>["refetch"];
};
