import FluxReduceStore from "flux/lib/FluxReduceStore";
import { FluxAction } from "../global/types/types";
import { Maybe } from "graphql/jsutils/Maybe";

export interface Item {
    id: number
    type: "ingredient" | "task"
}

interface State {
    activeItem: Item
    expandedId?: number
}

declare namespace ShoppingStore {
}

declare class ShoppingStore extends FluxReduceStore<State, FluxAction> {
    getActiveItem(): Maybe<ShoppingStore.Item>

    getExpandedIngredientId(): Maybe<number>
}


const shoppingStore: ShoppingStore;
export = shoppingStore;
