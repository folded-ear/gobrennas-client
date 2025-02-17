import throwAnyErrors from "@/util/throwAnyErrors";
import { gql } from "@/__generated__";
import {
    CombinePantryItemsMutation,
    PantryItem,
} from "@/__generated__/graphql";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";

const COMBINE_PANTRY_ITEMS = gql(`
mutation combinePantryItems($ids: [ID!]!) {
  pantry {
    combineItems(ids: $ids) {
      id
      name
      labels
      synonyms
    }
  }
}`);

type Result = Pick<PantryItem, "id" | "name" | "labels" | "synonyms">;

export const useCombinePantryItems = (): [
    (ids: string[]) => Promise<Result>,
    MutationResult<CombinePantryItemsMutation>,
] => {
    const [mutateFunction, out] = useMutation(COMBINE_PANTRY_ITEMS);

    const combine = useCallback(
        (ids: string[]) =>
            mutateFunction({ variables: { ids } }).then(({ data, errors }) => {
                throwAnyErrors(errors);
                if (!data?.pantry?.combineItems) {
                    return Promise.reject("Empty combine items response");
                }
                return data.pantry.combineItems;
            }),
        [mutateFunction],
    );

    return [combine, out];
};
