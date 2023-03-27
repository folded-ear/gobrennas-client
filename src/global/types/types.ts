export interface UserType {
    email: string,
    imageUrl?: string,
}

export type Ingredient = {
    id: number,
    name: string,
    type?: "Recipe" | "PantryItem"
}

export type IngredientRef = {
    raw?: string,
    quantity?: number,
    preparation?: string,
    units?: string,
    uomId?: string | number;
    ingredient?: string | Ingredient,
    ingredientId?: number,

    /**
     * On the shopping list, napalm entries will only have name, not raw.
     */
    name?: string
};

export type Recipe = {
    id: number,
    type: string,
    name: string,
    externalUrl: string,
    ingredients: IngredientRef[],
    labels: string[],
    directions: string,
    yield: number,
    totalTime: number,
    calories: number,
    photo: string,
    photoFocus: number[],
};

export type SharedRecipe = {
    id: number,
    secret: string,
    slug: string,
}

export type Plan = any
