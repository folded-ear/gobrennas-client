import { CheckableActionType } from "util/typedAction";

export interface UserType {
    id: number | string
    name: string | null
    provider: string
    email: string | null
    imageUrl: string | null
    roles: string[]
}

export interface Ingredient {
    id: number | string
    name: string
    type?: "Recipe" | "PantryItem"
}

export interface PantryItem extends Ingredient {
    storeOrder: number
}

export interface IngredientRef {
    raw?: string
    quantity?: number | null
    preparation?: string | null
    units?: string | null
    uomId?: string | number
    ingredient?: string | Ingredient | null
    ingredientId?: number

    /**
     * On the shopping list, napalm entries will only have name, not raw.
     */
    name?: string
}

export interface Quantity {
    quantity: number
    units?: string
    uomId?: number
}

export interface FluxAction {
    type: CheckableActionType

    [k: string]: any
}

export interface Page<E> {
    page: number
    pageSize: number
    first: boolean
    last: boolean
    content: E[]
}
