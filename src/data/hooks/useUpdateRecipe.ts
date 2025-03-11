import { gql } from "@/__generated__";
import { recipeToIngredientInfo } from "@/data/utils/graphql";
import { DraftRecipe } from "@/global/types/types";
import promiseWellSizedFile from "@/util/promiseWellSizedFile";
import { useMutation } from "@apollo/client";

const UPDATE_RECIPE_MUTATION = gql(`
mutation updateRecipe($id: ID!, $info: IngredientInfo!, $photo: Upload) {
  library {
    updateRecipe(id: $id, info: $info, photo: $photo) {
      ...recipeCore
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

        // noinspection SuspiciousTypeOfGuard
        return mutateFunction({
            variables: {
                id: recipe.id,
                info: recipeToIngredientInfo(recipe),
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
