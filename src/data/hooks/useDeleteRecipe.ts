import { gql } from "../../__generated__";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";
import {
    DeleteRecipeMutation,
    GetSearchLibraryDocument,
} from "../../__generated__/graphql";
import throwAnyGraphQLErrors from "../../util/throwAnyGraphQLErrors";
import { BfsId } from "../../global/types/identity";

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
        (id) =>
            mutateFunction({ variables: { id } }).then(({ errors }) => {
                throwAnyGraphQLErrors(errors);
                return true;
            }),
        [mutateFunction],
    );

    return [deleteRecipe, out];
};
