import { MutationResult, useMutation } from "@apollo/client";
import { gql } from "@/__generated__";
import {
    PlannedRecipeHistory,
    SetRecipeHistoryRatingMutation,
} from "@/__generated__/graphql";
import { useCallback } from "react";
import { BfsId } from "@/global/types/identity";

const SET_RECIPE_HISTORY_RATING = gql(`
mutation setRecipeHistoryRating($recipeId: ID!, $id: ID!, $rating: PositiveInt!) {
  library {
    history(recipeId: $recipeId) {
      setRating(id: $id, ratingInt: $rating) {
        id
        rating: ratingInt
      }
    }
  }
}
`);

type Result = Pick<PlannedRecipeHistory, "id"> & {
    rating: PlannedRecipeHistory["ratingInt"];
};

export const useSetRecipeHistoryRating = (): [
    (recipeId: BfsId, id: BfsId, rating: number) => Promise<Result>,
    MutationResult<SetRecipeHistoryRatingMutation>,
] => {
    const [mutateFunction, out] = useMutation(SET_RECIPE_HISTORY_RATING);

    const setRating = useCallback(
        (recipeId: BfsId, id: BfsId, rating: number) =>
            mutateFunction({
                variables: {
                    recipeId: "" + recipeId,
                    id: "" + id,
                    rating,
                },
            }).then(({ data, errors }) => {
                if (errors && errors.length) {
                    let msg = "Set history rating failed:\n\n" + errors[0];
                    if (errors.length > 1) {
                        msg += `\n\nPlus ${errors.length - 1} more.`;
                    }
                    return Promise.reject(msg);
                }
                const setRating = data?.library?.history?.setRating;
                if (!setRating) {
                    return Promise.reject("Empty set rating response");
                }
                return setRating;
            }),
        [mutateFunction],
    );

    return [setRating, out];
};
