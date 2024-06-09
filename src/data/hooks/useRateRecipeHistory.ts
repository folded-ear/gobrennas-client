import { MutationResult, useMutation } from "@apollo/client";
import { gql } from "__generated__";
import {
    PlannedRecipeHistory,
    RateRecipeHistoryMutation,
} from "../../__generated__/graphql";
import { useCallback } from "react";
import { BfsId } from "../../global/types/identity";

const RATE_RECIPE_HISTORY = gql(`
mutation rateRecipeHistory($recipeId: ID!, $id: ID!, $rating: PositiveInt!) {
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

export const useRateRecipeHistory = (): [
    (recipeId: BfsId, id: BfsId, rating: number) => Promise<Result>,
    MutationResult<RateRecipeHistoryMutation>,
] => {
    const [mutateFunction, out] = useMutation(RATE_RECIPE_HISTORY);

    const rate = useCallback(
        (recipeId: BfsId, id: BfsId, rating: number) =>
            mutateFunction({
                variables: {
                    recipeId: "" + recipeId,
                    id: "" + id,
                    rating,
                },
            }).then(({ data, errors }) => {
                if (errors && errors.length) {
                    let msg = "Rate history failed:\n\n" + errors[0];
                    if (errors.length > 1) {
                        msg += `\n\nPlus ${errors.length - 1} more.`;
                    }
                    return Promise.reject(msg);
                }
                const setRating = data?.library?.history?.setRating;
                if (!setRating) {
                    return Promise.reject("Empty rate response");
                }
                return setRating;
            }),
        [mutateFunction],
    );

    return [rate, out];
};
