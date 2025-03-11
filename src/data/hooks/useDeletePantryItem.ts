import { gql } from "@/__generated__";
import { DeletePantryItemMutation } from "@/__generated__/graphql";
import throwAnyErrors from "@/util/throwAnyErrors";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";

const DELETE_PANTRY_ITEM = gql(`
mutation deletePantryItem($id: ID!) {
  pantry {
    deleteItem(id: $id) {
      id
    }
  }
}`);

export const useDeletePantryItem = (): [
    (id: string) => Promise<boolean>,
    MutationResult<DeletePantryItemMutation>,
] => {
    const [mutateFunction, out] = useMutation(DELETE_PANTRY_ITEM, {
        update(cache, r) {
            const id = r.data?.pantry?.deleteItem.id;
            cache.evict({ id });
        },
    });

    const deleteItem = useCallback(
        (id: string) =>
            mutateFunction({ variables: { id } }).then(({ errors }) => {
                throwAnyErrors(errors);
                return true;
            }),
        [mutateFunction],
    );

    return [deleteItem, out];
};
