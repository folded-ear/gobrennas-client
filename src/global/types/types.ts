/**
 * Adding some utility types here for poorly types MUI enums
 */
export type MUISize =  "medium" | "small" | undefined

export type Optional<Type> = Type | null | undefined

export type OptionalNumberish = number | string | undefined

export type Ingredient = {
    id: number,
    name: string,
}

export type IngredientRef = {
    raw: string,
    quantity?: number,
    preparation?: string,
    units?: string,
    uomId?: string | number;
    ingredient?: string | Ingredient,
    ingredientId?: number,
};

export type Recipe = {
    id: number,
    type: string,
    name: string,
    externalUrl: string,
    ingredients: IngredientRef[],
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