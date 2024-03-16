import { ApolloError } from "@apollo/client";

export type UseQueryResult<T> = {
    loading: boolean;
    error?: ApolloError | boolean;
    data: T | null;
};
