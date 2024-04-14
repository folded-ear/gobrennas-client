import { gql } from "../../__generated__";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";
import { DeletePantryItemMutation } from "../../__generated__/graphql";
import throwAnyGraphQLErrors from "../../util/throwAnyGraphQLErrors";

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
                throwAnyGraphQLErrors(errors);
                return true;
            }),
        [mutateFunction],
    );

    return [deleteItem, out];
};
