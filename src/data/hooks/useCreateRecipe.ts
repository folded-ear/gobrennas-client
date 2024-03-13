import { useMutation } from "@apollo/client";
import { DraftRecipe } from "global/types/types";
import { gql } from "__generated__";
import { toMilliseconds } from "util/time";
import {
    GetSearchLibraryDocument,
    IngredientRefInfo,
} from "__generated__/graphql";

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

    const createRecipe = (recipe: DraftRecipe) => {
        return mutateFunction({
            variables: {
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
                    yield: recipe.recipeYield,
                    calories: recipe.calories,
                    totalTime: recipe.totalTime
                        ? toMilliseconds(recipe.totalTime)
                        : null,
                    photoFocus: recipe.photoFocus,
                },
                photo: recipe.photoUpload,
                cookThis: false,
            },
        });
    };

    return {
        createRecipe,
        error,
        loading,
    };
};
