import { gql } from "@/__generated__";
import { GetSearchLibraryDocument } from "@/__generated__/graphql";
import { recipeToIngredientInfo } from "@/data/utils/graphql";
import promiseScratchUpload from "@/data/utils/promiseScratchUpload";
import { DraftRecipe } from "@/global/types/types";
import { useMutation } from "@apollo/client";

const CREATE_RECIPE_FROM_MUTATION = gql(`
mutation createRecipeFrom($sourceRecipeId: ID!, $info: IngredientInfo!) {
  library {
    createRecipeFrom(sourceRecipeId: $sourceRecipeId, info: $info) {
      id
    }
  }
}
`);

export const useCreateRecipeFrom = () => {
    const [mutateFunction, { data, loading, error }] = useMutation(
        CREATE_RECIPE_FROM_MUTATION,
        { refetchQueries: [GetSearchLibraryDocument] },
    );

    const createRecipeFrom = async (recipe: DraftRecipe) => {
        const info = recipeToIngredientInfo(recipe);
        if (recipe.photoUpload) {
            info.photo = await promiseScratchUpload(recipe.photoUpload);
        }
        return mutateFunction({
            variables: {
                sourceRecipeId: recipe.id,
                info: info,
            },
        });
    };

    return {
        createRecipeFrom,
        data,
        error,
        loading,
    };
};
