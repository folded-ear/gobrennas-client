import { gql } from "__generated__";
import { useQuery } from "@apollo/client";
import { UseQueryResult } from "data/types";
import { useMemo } from "react";
import {
    PageInfo,
    PantryItemConnectionEdge,
    SortDir,
} from "../../__generated__/graphql";

// This is stupid, but its either increase the duplication even further or lose
// type safety. I'd rather abuse the server/database. I mentioned it's stupid?
const SEARCH_PANTRY_ITEMS_QUERY = gql(`
query pantryItems($query: String!, $first: NonNegativeInt, $after: Cursor, $sortBy: String, $sortDir: SortDir) {
  pantry {
    search(query: $query, first: $first, after: $after, sortBy: $sortBy, sortDir: $sortDir) {
      edges {
        node {
          id
          name
          storeOrder
          synonyms
          labels
          firstUse
          myUseCount: useCount(scope: MINE)
          allUseCount: useCount(scope: EVERYONE)
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}
`);

export type Result = Pick<
    PantryItemConnectionEdge["node"],
    "id" | "name" | "storeOrder" | "synonyms" | "labels"
> & {
    firstUse: Date;
    myUseCount: PantryItemConnectionEdge["node"]["useCount"];
    allUseCount: PantryItemConnectionEdge["node"]["useCount"];
};

interface Results {
    results: Result[];
    pageInfo: Pick<PageInfo, "hasNextPage">;
}

export interface QueryOptions {
    query?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: SortDir;
}

export const usePantryItemSearch = ({
    query = "",
    page = 0,
    pageSize = 25,
    sortBy = "name",
    sortDir = SortDir.Asc,
}: QueryOptions): UseQueryResult<Results> => {
    // DataGrid uses a numeric page model, while the GraphQL API uses cursors,
    // in the style of Relay. However! For the moment those cursors are merely
    // encoded numeric offsets, so do an end-run around tracking cursors in the
    // grid, and manually encode an offset-cursor as needed.
    const after = page === 0 ? null : btoa("offset-" + page * pageSize);
    const {
        loading,
        error,
        data: rawData,
    } = useQuery(SEARCH_PANTRY_ITEMS_QUERY, {
        variables: { query, first: pageSize, after, sortBy, sortDir },
        skip: pageSize <= 0,
    });
    const data = useMemo(() => {
        if (!rawData?.pantry?.search) {
            return null;
        }
        const { edges, pageInfo } = rawData.pantry.search;
        return {
            results: edges.map((e) => ({
                ...e.node,
                // why a DateTime scalar has to be manually parsed is unclear...
                firstUse: new Date(e.node.firstUse),
            })),
            pageInfo,
        };
    }, [rawData]);

    return {
        loading,
        error,
        data,
    };
};
