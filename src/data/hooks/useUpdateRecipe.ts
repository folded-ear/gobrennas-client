import { useMutation } from "@apollo/client";
import { gql } from "__generated__";
import { IngredientRefInfo } from "__generated__/graphql";
import { toMilliseconds } from "util/time";
import { DraftRecipe } from "global/types/types";
import promiseWellSizedFile from "util/promiseWellSizedFile";

const UPDATE_RECIPE_MUTATION = gql(`
mutation updateRecipe($id: ID!, $info: IngredientInfo!, $photo: Upload) {
  library {
    updateRecipe(id: $id, info: $info, photo: $photo) {
      ...recipeCore
      favorite
      yield
      calories
      externalUrl
      labels
      photo {
        url
        focus
      }
    }
  }
}
`);

export const useUpdateRecipe = () => {
    const [mutateFunction, { data, loading, error }] = useMutation(
        UPDATE_RECIPE_MUTATION,
    );

    const updateRecipe = async (recipe: DraftRecipe) => {
        let sizedUpload: File | string | null = null;

        if (recipe.photoUpload) {
            sizedUpload = await promiseWellSizedFile(recipe.photoUpload);
        }

        return mutateFunction({
            variables: {
                id: recipe.id.toString(),
                info: {
                    type: "Recipe",
                    name: recipe.name,
                    storeOrder: 1,
                    externalUrl: recipe.externalUrl,
                    directions: recipe.directions,
                    ingredients: recipe.ingredients.map((it) => {
                        it = { ...it };
                        delete it.id;
                        return it as IngredientRefInfo;
                    }),
                    labels: recipe.labels,
                    yield: recipe.recipeYield ? recipe.recipeYield : null,
                    calories: recipe.calories ? recipe.calories : null,
                    totalTime: recipe.totalTime
                        ? toMilliseconds(recipe.totalTime)
                        : null,
                    photoFocus: recipe.photoFocus,
                },
                photo: typeof sizedUpload !== "string" ? sizedUpload : null,
            },
        });
    };

    return {
        updateRecipe,
        data,
        error,
        loading,
    };
};
