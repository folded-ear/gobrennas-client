import { useQuery } from "@apollo/client";
import * as React from "react";
import {
    FullRecipe,
    IngredientRef,
    Recipe,
    Subrecipe,
} from "global/types/types";
import { useProfileId } from "providers/Profile";
import { UseQueryResult } from "data/types";
import { gql } from "__generated__";

const GET_FULL_RECIPE_QUERY = gql(`
query getRecipeWithEverything($id: ID!) {
  library {
    getRecipeById(id: $id) {
      ...recipeCore
      favorite
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
    }
  }
}
`);

export const useGetFullRecipe = (id: string): UseQueryResult<FullRecipe> => {
    const { loading, error, data } = useQuery(GET_FULL_RECIPE_QUERY, {
        variables: { id: id },
    });
    const myId = useProfileId();

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

    const subrecipes: Subrecipe[] = React.useMemo(() => {
        if (!result || !result.subrecipes) return [];
        return result.subrecipes.map((recipe) => ({
            id: parseInt(recipe.id, 10),
            name: recipe.name,
            totalTime: recipe.totalTime,
            directions: recipe.directions,
            ingredients: recipe.ingredients.map((item) => ({
                raw: item.raw,
                preparation: item.preparation,
                quantity: item.quantity?.quantity || null,
                units: item.quantity?.units?.name || null,
                ingredient: item.ingredient || null,
                ingredientId: 0,
                uomId: "",
            })),
        }));
    }, [result]);

    if (result && !loading) {
        const recipe: Recipe = {
            calories: result.calories,
            directions: result.directions || "",
            externalUrl: result.externalUrl,
            id: parseInt(result.id, 10),
            ingredients,
            labels: [],
            name: result.name || "",
            photo: result.photo?.url || null,
            photoFocus: result.photo?.focus || [],
            totalTime: result.totalTime,
            recipeYield: result.yield,
        };

        const fullRecipe: FullRecipe = {
            mine: result.owner.id === myId.toString(),
            owner: result.owner,
            recipe,
            subrecipes,
        };

        return {
            loading,
            error,
            data: fullRecipe,
        };
    }

    return {
        loading,
        error,
        data: null,
    };
};
