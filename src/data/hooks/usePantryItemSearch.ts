import { gql } from "__generated__";
import { useQuery } from "@apollo/client";
import { UseQueryResult } from "data/types";
import { BfsId } from "global/types/identity";
import { useMemo } from "react";
import {
    InputMaybe,
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
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
}
`);

export type Result = Pick<
    PantryItemConnectionEdge["node"],
    "name" | "storeOrder" | "synonyms" | "labels"
> & {
    id: BfsId;
    firstUse: Date;
    myUseCount: PantryItemConnectionEdge["node"]["useCount"];
    allUseCount: PantryItemConnectionEdge["node"]["useCount"];
};

interface Results {
    results: Result[];
    pageInfo: PageInfo;
}

export interface QueryOptions {
    query?: string;
    first?: number;
    after?: InputMaybe<string>;
    sortBy?: string;
    sortDir?: SortDir;
}

export const usePantryItemSearch = ({
    query = "",
    first = 25,
    after = null,
    sortBy = "name",
    sortDir = SortDir.Asc,
}: QueryOptions): UseQueryResult<Results> => {
    const {
        loading,
        error,
        data: rawData,
    } = useQuery(SEARCH_PANTRY_ITEMS_QUERY, {
        variables: { query, first, after, sortBy, sortDir },
        skip: first <= 0,
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
