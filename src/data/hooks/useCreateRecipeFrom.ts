import { useMutation } from "@apollo/client";
import { DraftRecipe } from "@/global/types/types";
import { gql } from "@/__generated__";
import { GetSearchLibraryDocument } from "@/__generated__/graphql";
import promiseWellSizedFile from "@/util/promiseWellSizedFile";
import { recipeToIngredientInfo } from "@/data/utils/graphql";
import { ensureString } from "@/global/types/identity";

const CREATE_RECIPE_FROM_MUTATION = gql(`
mutation createRecipeFrom($sourceRecipeId: ID!
  , $info: IngredientInfo!
  , $photo: Upload
) {
  library {
    createRecipeFrom(sourceRecipeId: $sourceRecipeId
      , info: $info
      , photo: $photo
      ) {
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
        let sizedUpload: File | string | null = null;

        if (recipe.photoUpload) {
            sizedUpload = await promiseWellSizedFile(recipe.photoUpload);
        }

        return mutateFunction({
            variables: {
                sourceRecipeId: ensureString(recipe.id),
                info: recipeToIngredientInfo(recipe),
                photo: typeof sizedUpload !== "string" ? sizedUpload : null,
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
