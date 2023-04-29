import { Ingredient } from "global/types/types";

export interface Recipe extends Ingredient {
    calories: number | null
    directions: string
    externalUrl: string | null
    id: number
    ingredients: any[]
    labels: string[]
    photo: string | null
    photoFocus: number[]
    totalTime: number | null
    yield: number | null
}

export interface RecipeFromTask extends Recipe {
    subtaskIds: number[]
    subrecipes: Recipe[]
}

export type Subrecipe = Pick<Recipe, "id" | "name" | "totalTime" | "ingredients" | "directions">;

export type FullRecipe = {
    recipe: Recipe
    subrecipes?: Recipe[]
    mine: boolean
    ownerId: string
}

export interface SharedRecipe {
    id: number
    secret: string
    slug: string
}