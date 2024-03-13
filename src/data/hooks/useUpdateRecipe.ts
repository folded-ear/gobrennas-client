import { useMutation } from "@apollo/client";
import { gql } from "__generated__";
import { IngredientRefInfo } from "__generated__/graphql";
import { toMilliseconds } from "util/time";
import { DraftRecipe } from "global/types/types";

const UPDATE_RECIPE_MUTATION = gql(`
mutation updateRecipe($id: ID!, $info: IngredientInfo!, $photo: Upload) {
  library {
    updateRecipe(id: $id, info: $info, photo: $photo) {
      id
      name
    }
  }
}
`);

export const useUpdateRecipe = () => {
    const [mutateFunction, { data, loading, error }] = useMutation(
        UPDATE_RECIPE_MUTATION,
    );

    const updateRecipe = (recipe: DraftRecipe) => {
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
                    yield: recipe.recipeYield,
                    calories: recipe.calories,
                    totalTime: recipe.totalTime
                        ? toMilliseconds(recipe.totalTime)
                        : null,
                    photoFocus: recipe.photoFocus,
                },
                photo: recipe.photoUpload,
            },
        });
    };

    return {
        updateRecipe,
        error,
        loading,
    };
};
