import { gql } from "@/__generated__";
import mapIngredientRef from "@/data/utils/mapIngredientRef";
import mapSection from "@/data/utils/mapSection";
import { BfsId } from "@/global/types/identity";
import { IIngredient, Recipe } from "@/global/types/types";
import useAdaptingQuery from "./useAdaptingQuery";

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

export const useGetFullRecipe = (id: BfsId, secret?: string) => {
    return useAdaptingQuery(
        GET_FULL_RECIPE_QUERY,
        (data, { loading }) => {
            const result = data?.library?.getRecipeById || null;

            if (!result || loading) return null;

            const ingredients =
                !result || !result.ingredients
                    ? []
                    : result.ingredients.map(mapIngredientRef<IIngredient>);

            const sections =
                !result || !result.sections
                    ? []
                    : result.sections.map(mapSection<IIngredient>);

            const subrecipes =
                !result || !result.subrecipes
                    ? []
                    : result.subrecipes.map((recipe) => ({
                          id: recipe.id,
                          name: recipe.name,
                          totalTime: recipe.totalTime,
                          directions: recipe.directions,
                          ingredients: recipe.ingredients.map(
                              mapIngredientRef<IIngredient>,
                          ),
                      }));

            const planHistory =
                !result || !result.plannedHistory ? [] : result.plannedHistory;

            const recipe: Recipe<IIngredient> = {
                calories: result.calories,
                directions: result.directions || "",
                externalUrl: result.externalUrl,
                id: result.id,
                ingredients,
                sections,
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
        },
        {
            variables: { id, secret: secret ?? null },
        },
    );
};
