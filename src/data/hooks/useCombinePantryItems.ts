import { MutationResult, useMutation } from "@apollo/client";
import {
    CombinePantryItemsMutation,
    PantryItem,
} from "../../__generated__/graphql";
import { gql } from "__generated__";
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
        (ids) =>
            mutateFunction({ variables: { ids } }).then(({ data, errors }) => {
                if (errors && errors.length) {
                    let msg = "Combine items failed:\n\n" + errors[0];
                    if (errors.length > 1) {
                        msg += `\n\nPlus ${errors.length - 1} more.`;
                    }
                    return Promise.reject(msg);
                }
                if (!data?.pantry?.combineItems) {
                    return Promise.reject("Empty combine items response");
                }
                return data.pantry.combineItems;
            }),
        [mutateFunction],
    );

    return [combine, out];
};
