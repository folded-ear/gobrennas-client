import React from "react";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import shoppingStore, { Item } from "data/shoppingStore";
import {
    isParent,
    isQuestionable,
    isSection,
} from "features/Planner/data/tasks";
import PlanItemStatus from "features/Planner/data/PlanItemStatus";
import TaskStore from "features/Planner/data/TaskStore";
import useFluxStore from "data/useFluxStore";
import groupBy from "util/groupBy";
import ShopList, {
    ShopItemTuple,
    ShopItemType,
} from "views/shop/ShopList";
import { PlanItem } from "../features/Planner/data/TaskStore";
import {
    BaseItemProp,
    ItemProps,
} from "views/shop/types";
import { Maybe } from "graphql/jsutils/Maybe";
import { Quantity } from "global/types/types";
import { ripLoadObject } from "util/ripLoadObject";

interface ItemTuple extends PlanItem, ItemProps {
}

interface PathedItemTuple extends ItemTuple {
    path: BaseItemProp[],
}

function gatherLeaves(item: PlanItem): PathedItemTuple[] {
    if (!isParent(item)) {
        if (isSection(item)) return [];
        return [ {
            ...item,
            path: [],
        } as unknown as PathedItemTuple ];
    }
    return TaskStore.getSubtaskLOs(item.id)
        .map(lo => ripLoadObject(lo))
        .filter(rippedLO => rippedLO.data)
        .map(rippedLO => {
            const item = rippedLO.data;
            if (!item) throw new TypeError("Missing required subtask");
            return {
                ...item,
                question: isQuestionable(item),
                loading: rippedLO.loading,
                deleting: item._next_status === PlanItemStatus.DELETED,
                completing: item._next_status === PlanItemStatus.COMPLETED,
                acquiring: item._next_status === PlanItemStatus.ACQUIRED,
                needing: item._next_status === PlanItemStatus.NEEDED,
            };
        })
        .flatMap(gatherLeaves)
        .map(it => ({
            ...it,
            path: it.path.concat(item),
        }));
}

interface Ingredient {
    name: string
    storeOrder?: number
}

interface OrderableIngredient {
    id: number
    items: PathedItemTuple[]
    data?: Ingredient
    loading: boolean
}

function groupItems(plans: PlanItem[],
                    expandedId: Maybe<number>,
                    activeItem: Maybe<Item>): ShopItemTuple[] {
    const leaves = plans
        .flatMap(gatherLeaves);
    if (plans.length === 1) {
        // kill the final path item; it's pointless
        for (const l of leaves) {
            l.path.splice(l.path.length - 1, 1);
        }
    }
    const byIngredient = groupBy(leaves, it => it.ingredientId);
    const unparsed: PathedItemTuple[] = [];
    if (byIngredient.has(undefined)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        unparsed.push(...byIngredient.get(undefined)!
            .filter(it => it.status === PlanItemStatus.NEEDED));
        byIngredient.delete(undefined);
    }
    const orderedIngredients: OrderableIngredient[] = [];
    for (const [ ingId, items ] of byIngredient) {
        if (ingId == null) continue;
        orderedIngredients.push({
            id: ingId,
            items: items,
            ...ripLoadObject(LibraryStore.getIngredientById(ingId)),
        });
    }
    orderedIngredients.sort(({ data: a }, { data: b }) => {
        if (!a) return b ? 1 : 0;
        if (!b) return -1;
        if (a.storeOrder == null) return b.storeOrder != null ? 1 : 0;
        if (b.storeOrder == null) return -1;
        if (a.storeOrder !== b.storeOrder) return a.storeOrder - b.storeOrder;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    const theTree: ShopItemTuple[] = [];
    for (const { id: ingId, items, data: ingredient, loading } of orderedIngredients) {
        const neededItems = items.filter(it => it.status === PlanItemStatus.NEEDED);
        if (neededItems.length === 0) continue;
        const unitLookup = new Map();
        const byUnit = groupBy(neededItems, it => {
            if (it.uomId) {
                unitLookup.set(it.uomId, it.units);
            }
            return it.uomId;
        });
        const quantities: Quantity[] = [];
        for (const uomId of byUnit.keys()) {
            quantities.push({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                quantity: byUnit.get(uomId)!
                    .reduce((q, it) => q + (it.quantity || 0), 0),
                uomId,
                units: unitLookup.get(uomId),
            });
        }
        const expanded = ingId === expandedId;
        theTree.push({
            _type: ShopItemType.INGREDIENT,
            id: ingId,
            itemIds: items.map(it => it.id),
            name: ingredient ? ingredient.name : items[0].name,
            quantities,
            expanded,
            loading: loading || items.some(it => it.loading),
            acquiring: items.every(it => it.acquiring || it.status === PlanItemStatus.ACQUIRED),
            deleting: items.every(it => it.deleting || it.status === PlanItemStatus.DELETED),
            depth: 0,
            path: [],
        });
        if (expanded) {
            theTree.push(...items.map(it => ({
                _type: ShopItemType.PLAN_ITEM,
                depth: 1,
                ingredient,
                ...it,
            })));
        }
    }
    // add the garbage at the bottom
    theTree.push(...unparsed.map(it => ({
        _type: ShopItemType.PLAN_ITEM,
        depth: 0,
        ...it,
    })));
    return activeItem
        ? theTree.map(it => {
            if (it.id === activeItem.id && it._type === activeItem.type) {
                it = {
                    ...it,
                    active: true,
                };
            }
            return it;
        })
        : theTree;
}

const Shop = () => {
    const [ expandedId, activeItem ] = useFluxStore(
        () => [
            shoppingStore.getExpandedIngredientId(),
            shoppingStore.getActiveItem(),
        ],
        [ shoppingStore ],
    );
    const [ plan, itemTuples ] = useFluxStore(
        () => {
            const plan = ripLoadObject(TaskStore.getActiveListLO()).data;
            return [ plan, plan
                ? groupItems([ plan ], expandedId, activeItem)
                : [],
            ];
        },
        [ TaskStore, LibraryStore ],
        [ expandedId, activeItem ],
    );
    return <ShopList
        plan={plan}
        itemTuples={itemTuples}
    />;
};

export default Shop;
