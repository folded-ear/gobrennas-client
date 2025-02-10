import { BfsId, ensureString } from "@/global/types/identity";
import throwAnyErrors from "@/util/throwAnyErrors";
import { gql } from "@/__generated__";
import {
    DeleteRecipeMutation,
    GetSearchLibraryDocument,
} from "@/__generated__/graphql";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";

const DELETE_RECIPE = gql(`
mutation deleteRecipe($id: ID!) {
  library {
    deleteRecipe(id: $id) {
      id
    }
  }
}`);

export const useDeleteRecipe = (): [
    (id: BfsId) => Promise<boolean>,
    MutationResult<DeleteRecipeMutation>,
] => {
    const [mutateFunction, out] = useMutation(DELETE_RECIPE, {
        refetchQueries: [GetSearchLibraryDocument],
        update(cache, r) {
            const id = r.data?.library?.deleteRecipe.id;
            cache.evict({ id });
        },
    });

    const deleteRecipe = useCallback(
        (id: BfsId) =>
            mutateFunction({ variables: { id: ensureString(id) } }).then(
                ({ errors }) => {
                    throwAnyErrors(errors);
                    return true;
                },
            ),
        [mutateFunction],
    );

    return [deleteRecipe, out];
};
