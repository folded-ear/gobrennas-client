import { PageInfo } from "@/__generated__/graphql";

export type Results<T> = {
    results: T[];
    pageInfo: Partial<PageInfo>;
} | null;
