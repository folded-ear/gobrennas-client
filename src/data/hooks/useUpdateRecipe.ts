import { useMutation } from "@apollo/client";
import { gql } from "@/__generated__";
import { DraftRecipe } from "@/global/types/types";
import promiseWellSizedFile from "@/util/promiseWellSizedFile";
import { recipeToIngredientInfo } from "@/data/utils/graphql";

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
