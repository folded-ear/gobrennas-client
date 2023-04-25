import {
    Ingredient,
    IngredientRef
} from "global/types/types";

export interface Recipe extends Ingredient {
    externalUrl: string
    ingredients: IngredientRef[]
    labels: string[]
    directions: string
    yield: number
    totalTime: number
    calories: number
    photo: string
    photoFocus: number[]
}

export interface RecipeFromTask extends Recipe {
    subtaskIds: number[]
    subrecipes: Recipe[]
}

export type Subrecipe = Pick<Recipe, "id" | "name" | "totalTime" | "ingredients" | "directions">;

export interface SharedRecipe {
    id: number
    secret: string
    slug: string
}