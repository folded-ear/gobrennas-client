import { gql } from "__generated__";
import { UseQueryResult } from "data/types";
import { IngredientRef, Recipe } from "global/types/types";
import { BfsId } from "global/types/identity";
import { GetRecipeQuery } from "../../__generated__/graphql";
import useAdaptingQuery from "./useAdaptingQuery";
import objectWithType from "../utils/objectWithType";

const GET_RECIPE_QUERY = gql(`
query getRecipe($id: ID!) {
  library {
    getRecipeById(id: $id) {
      ...recipeCore
      yield
      calories
      externalUrl
      labels
      photo {
        url
        focus
      }
      owner {
        id
      }
    }
  }
}
`);

function adapter(data: GetRecipeQuery | undefined) {
    const result = data?.library?.getRecipeById || null;

    const ingredients: IngredientRef[] =
        !result || !result.ingredients
            ? []
            : result.ingredients.map((item) => ({
                  raw: item.raw,
                  preparation: item.preparation,
                  quantity: item.quantity?.quantity || null,
                  units: item.quantity?.units?.name || null,
                  ingredient: objectWithType(item.ingredient),
              }));

    const recipe: Recipe = {
        id: result?.id as BfsId,
        ownerId: result?.owner.id,
        calories: result?.calories || null,
        directions: result?.directions || null,
        externalUrl: result?.externalUrl || null,
        ingredients,
        labels: result?.labels || [],
        name: result?.name || "",
        photo: result?.photo?.url || null,
        photoFocus: result?.photo?.focus || [],
        totalTime: result?.totalTime || null,
        recipeYield: result?.yield || null,
    };
    return recipe;
}

export const useGetRecipe = (
    id: string,
): UseQueryResult<Recipe, { id: string }> => {
    return useAdaptingQuery(GET_RECIPE_QUERY, adapter, {
        variables: { id: id },
    });
};
