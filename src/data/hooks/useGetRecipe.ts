import { gql } from "__generated__";
import { useQuery } from "@apollo/client";
import { UseQueryResult } from "data/types";
import { IngredientRef, Recipe } from "global/types/types";
import { BfsId } from "global/types/identity";
import * as React from "react";

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
    }
  }
}
`);

export const useGetRecipe = (id: string): UseQueryResult<Recipe> => {
    const { loading, error, data } = useQuery(GET_RECIPE_QUERY, {
        variables: { id: id },
    });

    const result = data?.library?.getRecipeById || null;

    const ingredients: IngredientRef[] = React.useMemo(() => {
        if (!result || !result.ingredients) return [];
        return result.ingredients.map((item) => ({
            raw: item.raw,
            preparation: item.preparation,
            quantity: item.quantity?.quantity || null,
            units: item.quantity?.units?.name || null,
            ingredient: item.ingredient,
        }));
    }, [result]);

    const recipe: Recipe = {
        id: result?.id as BfsId,
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

    return {
        loading,
        error,
        data: recipe,
    };
};
