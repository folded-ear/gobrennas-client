import { gql } from "../../__generated__";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";
import { DeletePantryItemMutation } from "../../__generated__/graphql";

const DELETE_PANTRY_ITEM = gql(`
mutation deletePantryItem($id: ID!) {
  pantry {
    deleteItem(id: $id)
  }
}`);

export const useDeletePantryItem = (): [
    (id: string) => Promise<boolean>,
    MutationResult<DeletePantryItemMutation>,
] => {
    const [mutateFunction, out] = useMutation(DELETE_PANTRY_ITEM);

    const deleteItem = useCallback(
        (id) =>
            mutateFunction({ variables: { id } }).then(({ errors }) => {
                if (errors && errors.length) {
                    let msg = "Delete item failed:\n\n" + errors[0];
                    if (errors.length > 1) {
                        msg += `\n\nPlus ${errors.length - 1} more.`;
                    }
                    return Promise.reject(msg);
                }
                return true;
            }),
        [mutateFunction],
    );

    return [deleteItem, out];
};
