import { BfsId, ensureString } from "@/global/types/identity";
import { gql } from "@/__generated__";
import {
    PlannedRecipeHistory,
    SetRecipeHistoryNotesMutation,
} from "@/__generated__/graphql";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";

const SET_RECIPE_HISTORY_NOTES = gql(`
mutation setRecipeHistoryNotes($recipeId: ID!, $id: ID!, $notes: String!) {
  library {
    history(recipeId: $recipeId) {
      setNotes(id: $id, notes: $notes) {
        id
        notes
      }
    }
  }
}
`);

type Result = Pick<PlannedRecipeHistory, "id" | "notes">;

export const useSetRecipeHistoryNotes = (): [
    (recipeId: BfsId, id: BfsId, notes: string) => Promise<Result>,
    MutationResult<SetRecipeHistoryNotesMutation>,
] => {
    const [mutateFunction, out] = useMutation(SET_RECIPE_HISTORY_NOTES);

    const setNotes = useCallback(
        (recipeId: BfsId, id: BfsId, notes: string) =>
            mutateFunction({
                variables: {
                    recipeId: ensureString(recipeId),
                    id: ensureString(id),
                    notes,
                },
            }).then(({ data, errors }) => {
                if (errors && errors.length) {
                    let msg = "Set history notes failed:\n\n" + errors[0];
                    if (errors.length > 1) {
                        msg += `\n\nPlus ${errors.length - 1} more.`;
                    }
                    return Promise.reject(msg);
                }
                const setNotes = data?.library?.history?.setNotes;
                if (!setNotes) {
                    return Promise.reject("Empty set notes response");
                }
                return setNotes;
            }),
        [mutateFunction],
    );

    return [setNotes, out];
};
