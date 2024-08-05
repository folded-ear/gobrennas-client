import { useMutation } from "@apollo/client";
import { DraftRecipe } from "@/global/types/types";
import { gql } from "@/__generated__";
import { GetSearchLibraryDocument } from "@/__generated__/graphql";
import promiseWellSizedFile from "@/util/promiseWellSizedFile";
import { recipeToIngredientInfo } from "@/data/utils/graphql";

const CREATE_RECIPE_MUTATION = gql(`
mutation createRecipe($info: IngredientInfo!, $photo: Upload, $cookThis: Boolean) {
  library {
    createRecipe(info: $info, photo: $photo, cookThis: $cookThis) {
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
        let sizedUpload: File | string | null = null;

        if (recipe.photoUpload) {
            sizedUpload = await promiseWellSizedFile(recipe.photoUpload);
        }

        return mutateFunction({
            variables: {
                info: recipeToIngredientInfo(recipe),
                photo: typeof sizedUpload !== "string" ? sizedUpload : null,
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
