import { Recipe } from "__generated__/graphql";

export type DraftRecipe = Omit<Recipe, "owner" | "subrecipes" | "favorite">;
