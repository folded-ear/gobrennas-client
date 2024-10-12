import { gql } from "@/__generated__";
import {
    IngredientRef,
    PantryItemUsesQuery,
    Recipe,
    User,
} from "@/__generated__/graphql";
import useAdaptingQuery from "./useAdaptingQuery";

const PANTRY_ITEMS_USES = gql(`
query pantryItemUses($id: ID!) {
  library {
    recipes(ingredients: [$id], first: 10, scope: EVERYONE) {
      edges {
        node {
          id
          name
          ingredients (ingredients: [$id]) {
            raw
          }
          owner {
            name
            email
            imageUrl
          }
        }
      }
    }
  }
}
`);

type Result = Pick<Recipe, "id" | "name"> & {
    owner: Pick<User, "name" | "email" | "imageUrl">;
    uses: IngredientRef["raw"][];
};

type Results = Result[] | null;

function adapter(rawData: PantryItemUsesQuery | undefined): Results {
    if (!rawData?.library?.recipes?.edges) {
        return null;
    }
    return rawData.library.recipes.edges.map((e) => ({
        ...e.node,
        uses: e.node.ingredients.map((r) => r.raw),
    }));
}

export const usePantryItemUses = (id: string) => {
    return useAdaptingQuery(PANTRY_ITEMS_USES, adapter, {
        fetchPolicy: "cache-and-network",
        variables: { id },
    });
};
