import {
    Ingredient,
    IngredientRef
} from "global/types/types";

export interface Recipe extends Ingredient {
    calories: number | null
    directions: string | null
    externalUrl: string | null
    id: number
    ingredients: IngredientRef[]
    labels: string[]
    photo: string | null
    photoFocus: number[]
    totalTime: number | null
    yield: number | null
}

// export interface IngredientRef {
//     raw: string,
//     preparation: string | null,
//     quantity: number | null,
//     units: string | null
//     ingredient: PantryItemRef | RecipeRef | null
// }
//
// type PantryItemRef = Pick<PantryItem, "id" | "name">
//
// type RecipeRef = Pick<Recipe, "id" | "name">

export interface RecipeFromTask extends Recipe {
    subtaskIds: number[]
    subrecipes: Recipe[]
}

export type Subrecipe = Pick<Recipe, "id" | "name" | "totalTime" | "ingredients" | "directions">;

export type FullRecipe = {
    recipe: Recipe
    subrecipes: Subrecipe[]
    mine: boolean
    ownerId: string
}

export interface SharedRecipe {
    id: number
    secret: string
    slug: string
}