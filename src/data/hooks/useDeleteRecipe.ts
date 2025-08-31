import { gql } from "@/__generated__";
import { GetSearchLibraryDocument } from "@/__generated__/graphql";
import { BfsId } from "@/global/types/identity";
import throwAnyErrors from "@/util/throwAnyErrors";
import { useMutation } from "@apollo/client";
import { useCallback } from "react";

const DELETE_RECIPE = gql(`
mutation deleteRecipe($id: ID!) {
  library {
    deleteRecipe(id: $id) {
      id
    }
  }
}`);

export const useDeleteRecipe = () => {
    const [mutateFunction, { data, loading, error }] = useMutation(
        DELETE_RECIPE,
        {
            refetchQueries: [GetSearchLibraryDocument],
            update(cache, r) {
                const id = r.data?.library?.deleteRecipe.id;
                cache.evict({ id });
            },
        },
    );

    const deleteRecipe = useCallback(
        (id: BfsId) =>
            mutateFunction({ variables: { id } }).then(({ errors }) => {
                throwAnyErrors(errors);
                return true;
            }),
        [mutateFunction],
    );

    return { deleteRecipe, data, error, loading };
};
