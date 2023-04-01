import React from "react";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import ShoppingStore, { Item } from "data/ShoppingStore";
import {
    isParent,
    isQuestionable,
    isSection,
} from "features/Planner/data/tasks";
import TaskStatus from "features/Planner/data/TaskStatus";
import TaskStore from "features/Planner/data/TaskStore";
import useFluxStore from "data/useFluxStore";
import groupBy from "util/groupBy";
import ShopList, {
    ShopItemTuple,
    ShopItemType,
} from "views/shop/ShopList";
import { Task } from "../features/Planner/data/TaskStore";
import {
    BaseItemProp,
    ItemProps,
} from "../views/shop/types";
import { Maybe } from "graphql/jsutils/Maybe";
import LoadObject from "../util/LoadObject";
import { Quantity } from "../global/types/types";

interface TaskTuple extends Task, ItemProps {
}

interface PathedTaskTuple extends TaskTuple {
    path: BaseItemProp[],
}

function gatherLeaves(item: Task): PathedTaskTuple[] {
    if (!isParent(item)) {
        if (isSection(item)) return [];
        return [ {
            ...item,
            path: [],
        } as unknown as PathedTaskTuple ];
    }
    return TaskStore.getSubtaskLOs(item.id)
        .filter(lo => lo.hasValue())
        .map(lo => {
            const item = lo.getValueEnforcing();
            return {
                ...item,
                question: isQuestionable(item),
                loading: lo.isLoading(),
                deleting: item._next_status === TaskStatus.DELETED,
                completing: item._next_status === TaskStatus.COMPLETED,
                acquiring: item._next_status === TaskStatus.ACQUIRED,
                needing: item._next_status === TaskStatus.NEEDED,
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
    items: PathedTaskTuple[]
    lo: LoadObject<Ingredient>
}

function groupItems(plans: Task[],
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
    const unparsed: PathedTaskTuple[] = [];
    if (byIngredient.has(undefined)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        unparsed.push(...byIngredient.get(undefined)!
            .filter(it => it.status === TaskStatus.NEEDED));
        byIngredient.delete(undefined);
    }
    const orderedIngredients: OrderableIngredient[] = [];
    for (const [ ingId, items ] of byIngredient) {
        if (ingId == null) continue;
        orderedIngredients.push({
            id: ingId,
            items: items,
            lo: LibraryStore.getIngredientById(ingId),
        });
    }
    orderedIngredients.sort(({ lo: alo }, { lo: blo }) => {
        if (!alo.hasValue()) return blo.hasValue() ? 1 : 0;
        if (!blo.hasValue()) return -1;
        const a = alo.getValueEnforcing();
        const b = blo.getValueEnforcing();
        if (a.storeOrder == null) return b.storeOrder != null ? 1 : 0;
        if (b.storeOrder == null) return -1;
        if (a.storeOrder !== b.storeOrder) return a.storeOrder - b.storeOrder;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    const theTree: ShopItemTuple[] = [];
    for (const { id: ingId, items, lo } of orderedIngredients) {
        const neededItems = items.filter(it => it.status === TaskStatus.NEEDED);
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
            name: lo.hasValue() ? lo.getValueEnforcing().name : items[0].name,
            quantities,
            expanded,
            loading: lo.isLoading() || items.some(it => it.loading),
            acquiring: items.every(it => it.acquiring || it.status === TaskStatus.ACQUIRED),
            deleting: items.every(it => it.deleting || it.status === TaskStatus.DELETED),
            depth: 0,
            path: [],
        });
        if (expanded) {
            const ingredient = lo.hasValue() ? lo.getValueEnforcing() : null;
            theTree.push(...items.map(it => ({
                _type: ShopItemType.TASK,
                depth: 1,
                ingredient,
                ...it,
            })));
        }
    }
    // add the garbage at the bottom
    theTree.push(...unparsed.map(it => ({
        _type: ShopItemType.TASK,
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
    const [expandedId, activeItem] = useFluxStore(
        () => [
            ShoppingStore.getExpandedIngredientId(),
            ShoppingStore.getActiveItem(),
        ],
        [ShoppingStore]
    );
    const [planLO, itemTuples] = useFluxStore(
        () => {
            const planLO = TaskStore.getActiveListLO();
            return [planLO, planLO.hasValue()
                ? groupItems([planLO.getValueEnforcing()], expandedId, activeItem)
                : [],
            ];
        },
        [TaskStore, LibraryStore],
        [expandedId, activeItem]
    );
    return <ShopList
        planLO={planLO}
        itemTuples={itemTuples}
    />;
};

export default Shop;
