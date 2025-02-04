import { IngredientRef, Recipe, Subrecipe } from "@/global/types/types";
import { gql } from "@/__generated__";
import { GetRecipeWithEverythingQuery } from "@/__generated__/graphql";
import useAdaptingQuery from "./useAdaptingQuery";
import { ApolloQueryResult, QueryResult } from "@apollo/client";
import { BfsStringId } from "@/global/types/identity";
import objectWithType from "@/data/utils/objectWithType";

const GET_FULL_RECIPE_QUERY = gql(`
query getRecipeWithEverything($id: ID!, $secret: String) {
  library {
    getRecipeById(id: $id, secret: $secret) {
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
        name
        email
        imageUrl
      }
      subrecipes {
        ...recipeCore
      }
      plannedHistory {
        id
        plannedAt
        doneAt
        status
        owner {
          name
          email
          imageUrl
        }
        rating: ratingInt
        notes
      }
    }
  }
}
`);

function adapter(
    data: GetRecipeWithEverythingQuery | undefined,
    { loading }: QueryResult | ApolloQueryResult<any>,
) {
    const result = data?.library?.getRecipeById || null;

    if (!result || loading) return null;

    const ingredients: IngredientRef[] =
        !result || !result.ingredients
            ? []
            : result.ingredients.map((item) => ({
                  raw: item.raw,
                  preparation: item.preparation,
                  quantity: item.quantity?.quantity,
                  units: item.quantity?.units?.name || null,
                  ingredient: objectWithType(item.ingredient),
              }));

    const subrecipes: Subrecipe[] =
        !result || !result.subrecipes
            ? []
            : result.subrecipes.map((recipe) => ({
                  id: recipe.id,
                  name: recipe.name,
                  totalTime: recipe.totalTime,
                  directions: recipe.directions,
                  ingredients: recipe.ingredients.map((item) => ({
                      raw: item.raw,
                      preparation: item.preparation,
                      quantity: item.quantity?.quantity,
                      units: item.quantity?.units?.name || null,
                      ingredient: objectWithType(item.ingredient),
                      ingredientId: item.ingredient ? item.ingredient.id : null,
                  })),
              }));

    const planHistory =
        !result || !result.plannedHistory ? [] : result.plannedHistory;

    const recipe: Recipe = {
        calories: result.calories,
        directions: result.directions || "",
        externalUrl: result.externalUrl,
        id: result.id,
        ingredients,
        labels: result.labels || [],
        name: result.name || "",
        photo: result.photo?.url || null,
        photoFocus: result.photo?.focus || [],
        totalTime: result.totalTime,
        recipeYield: result.yield,
    };

    return {
        owner: result.owner,
        recipe,
        subrecipes,
        planHistory,
    };
}

export const useGetFullRecipe = (id: BfsStringId, secret?: string) => {
    return useAdaptingQuery(GET_FULL_RECIPE_QUERY, adapter, {
        variables: { id, secret: secret ?? null },
    });
};
