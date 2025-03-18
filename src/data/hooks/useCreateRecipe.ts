import { gql } from "@/__generated__";
import { GetSearchLibraryDocument } from "@/__generated__/graphql";
import { recipeToIngredientInfo } from "@/data/utils/graphql";
import promiseScratchUpload from "@/data/utils/promiseScratchUpload";
import { DraftRecipe } from "@/global/types/types";
import { useMutation } from "@apollo/client";

const CREATE_RECIPE_MUTATION = gql(`
mutation createRecipe($info: IngredientInfo!, $cookThis: Boolean) {
  library {
    createRecipe(info: $info, cookThis: $cookThis) {
      id
    }
  }
}
`);

export const useCreateRecipe = () => {
    const [mutateFunction, { data, loading, error }] = useMutation(
        CREATE_RECIPE_MUTATION,
        { refetchQueries: [GetSearchLibraryDocument] },
    );

    const createRecipe = async (recipe: DraftRecipe) => {
        const info = recipeToIngredientInfo(recipe);
        if (recipe.photoUpload) {
            info.photo = await promiseScratchUpload(recipe.photoUpload);
        }
        return mutateFunction({
            variables: {
                info: info,
                cookThis: false,
            },
        });
    };

    return {
        createRecipe,
        data,
        error,
        loading,
    };
};
