import { gql } from "@/__generated__";
import { recipeToIngredientInfo } from "@/data/utils/graphql";
import promiseScratchUpload from "@/data/utils/promiseScratchUpload";
import { DraftRecipe } from "@/global/types/types";
import { useMutation } from "@apollo/client";

const UPDATE_RECIPE_MUTATION = gql(`
mutation updateRecipe($id: ID!, $info: IngredientInfo!) {
  library {
    updateRecipe(id: $id, info: $info) {
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
        const info = recipeToIngredientInfo(recipe);
        if (recipe.photoUpload) {
            info.photo = await promiseScratchUpload(recipe.photoUpload);
        }
        return mutateFunction({
            variables: {
                id: recipe.id,
                info,
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
