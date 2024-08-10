import { useCallback, useEffect, useState } from "react";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import shoppingStore, { Item } from "@/data/shoppingStore";
import {
    isParent,
    isQuestionable,
    isSection,
} from "@/features/Planner/data/plannerUtils";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import planStore, { PlanItem } from "@/features/Planner/data/planStore";
import useFluxStore from "@/data/useFluxStore";
import groupBy from "@/util/groupBy";
import ShopList, { ShopItemTuple, ShopItemType } from "@/views/shop/ShopList";
import { BaseItemProp, ItemProps } from "@/views/shop/types";
import { Maybe } from "graphql/jsutils/Maybe";
import { Quantity } from "@/global/types/types";
import { BfsId } from "@/global/types/identity";
import windowStore from "@/data/WindowStore";
import partition from "@/util/partition";
import { intersection } from "@/util/arrayAsSet";
import useActiveShoppingPlanIds from "@/data/useActiveShoppingPlanIds";

interface ItemTuple extends PlanItem, ItemProps {
    status: string;
}

interface PathedItemTuple extends ItemTuple {
    path: BaseItemProp[];
}

function gatherLeaves(item: PlanItem): PathedItemTuple[] {
    if (!isParent(item)) {
        if (isSection(item)) return [];
        return [
            {
                ...item,
                path: [],
            } as unknown as PathedItemTuple,
        ];
    }
    return planStore
        .getChildItemRlos(item.id)
        .filter((rippedLO) => rippedLO.data)
        .map((rippedLO) => {
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
        .map((it) => ({
            ...it,
            path: it.path.concat(item),
        }));
}

interface Ingredient {
    name: string;
    storeOrder?: number;
}

interface OrderableIngredient {
    id: number;
    items: PathedItemTuple[];
    data?: Ingredient;
    loading?: boolean;
}

function isZeroQuantity(it: PathedItemTuple) {
    return it.quantity === 0;
}

function isOrWillBeAcquired(it: PathedItemTuple) {
    return (
        it.acquiring ||
        (it.status === PlanItemStatus.ACQUIRED && !it.needing) ||
        isZeroQuantity(it)
    );
}

function groupItems(
    plans: PlanItem[],
    expandedId: Maybe<number>,
    activeItem: Maybe<Item>,
): ShopItemTuple[] {
    if (plans.length === 0) return [];
    const leaves = plans.flatMap(gatherLeaves);
    if (plans.length === 1) {
        // kill the final path item; it's pointless
        for (const l of leaves) {
            l.path.splice(l.path.length - 1, 1);
        }
    }
    const byIngredient = groupBy(leaves, (it) => it.ingredientId);
    const unparsed: PathedItemTuple[] = [];
    if (byIngredient.has(undefined)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        unparsed.push(...byIngredient.get(undefined)!);
        byIngredient.delete(undefined);
    }
    const orderedIngredients: OrderableIngredient[] = [];
    for (const [ingId, items] of byIngredient) {
        if (ingId == null) continue;
        orderedIngredients.push({
            id: ingId,
            items: items,
            ...LibraryStore.getIngredientRloById(ingId),
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
    for (const {
        id: ingId,
        items,
        data: ingredient,
        loading,
    } of orderedIngredients) {
        if (items.length === 0) continue;
        const allAcquiring = items.every(isOrWillBeAcquired);
        const toAgg =
            !allAcquiring && items.some(isOrWillBeAcquired)
                ? items.filter((it) => !isOrWillBeAcquired(it))
                : items.filter((it) => !isZeroQuantity(it));
        const unitLookup = new Map();
        const byUnit = groupBy(toAgg, (it) => {
            if (it.uomId) {
                unitLookup.set(it.uomId, it.units);
            }
            return it.uomId;
        });
        const quantities: Quantity[] = [];
        for (const uomId of byUnit.keys()) {
            quantities.push({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                quantity: byUnit
                    .get(uomId)!
                    .reduce((q, it) => q + (it.quantity || 0), 0),
                uomId,
                units: unitLookup.get(uomId),
            });
        }
        const expanded = ingId === expandedId;
        theTree.push({
            _type: ShopItemType.INGREDIENT,
            id: ingId,
            itemIds: items.map((it) => it.id),
            name: ingredient ? ingredient.name : items[0].name,
            storeOrder: ingredient?.storeOrder,
            quantities,
            expanded,
            loading: loading || items.some((it) => it.loading),
            acquiring: allAcquiring,
            deleting: items.every(
                (it) => it.deleting || it.status === PlanItemStatus.DELETED,
            ),
            depth: 0,
            path: [],
        });
        if (expanded) {
            theTree.push(
                ...items.map((it) => ({
                    _type: ShopItemType.PLAN_ITEM,
                    depth: 1,
                    blockId: ingId,
                    ingredient,
                    ...it,
                    acquiring: isOrWillBeAcquired(it),
                })),
            );
        }
    }
    // add the garbage at the bottom
    theTree.push(
        ...unparsed.map((it) => ({
            _type: ShopItemType.PLAN_ITEM,
            depth: 0,
            ...it,
            acquiring: isOrWillBeAcquired(it),
        })),
    );
    return activeItem
        ? theTree.map((it) => {
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
            shoppingStore.getExpandedIngredientId(),
            shoppingStore.getActiveItem(),
        ],
        [shoppingStore],
    );
    const activePlanIds = useActiveShoppingPlanIds();
    const [plans, itemTuples] = useFluxStore(
        () => {
            const plans: PlanItem[] = [];
            if (activePlanIds != null && activePlanIds.length > 0) {
                const allPlanIds = planStore.getPlanIdsRlo().data;
                for (const id of intersection(allPlanIds, activePlanIds)) {
                    const p = planStore.getItemRlo(id).data;
                    if (p != null) plans.push(p);
                }
            }
            if (plans.length === 0) {
                const p = planStore.getActivePlanRlo().data;
                if (p != null) plans.push(p);
            }
            return [plans, groupItems(plans, expandedId, activeItem)];
        },
        [planStore, LibraryStore],
        [expandedId, activeItem, activePlanIds],
    );
    const [partitionReqCount, setPartitionReqCount] = useState(0);
    const handleRepartition = useCallback(
        () => setPartitionReqCount((v) => v + 1),
        [],
    );
    // repartition when the window loses focus
    useFluxStore(() => {
        if (!windowStore.isFocused()) {
            handleRepartition();
        }
    }, [windowStore]);
    // repartition on initial item load
    const [, setEmpty] = useState(true);
    useEffect(() => {
        setEmpty((curr) => {
            const next = itemTuples.length === 0;
            if (curr && !next) handleRepartition();
            return next;
        });
    }, [handleRepartition, itemTuples.length]);
    // repartition on active plan change
    useEffect(() => {
        handleRepartition();
    }, [handleRepartition, activePlanIds]);
    const [acquiredIds, setAcquiredIds] = useState<Set<BfsId>>(new Set());
    useEffect(() => {
        setAcquiredIds(
            new Set(itemTuples.filter((it) => it.acquiring).map((it) => it.id)),
        );
    }, [partitionReqCount]);
    const [partitionedTuples, setPartitionedTuples] = useState<
        ShopItemTuple[][]
    >([[], []]);
    useEffect(() => {
        setPartitionedTuples(
            partition(
                itemTuples,
                (it) => !acquiredIds.has(it.blockId || it.id),
            ),
        );
    }, [itemTuples, acquiredIds]);
    return (
        <ShopList
            plans={plans}
            neededTuples={partitionedTuples[0]}
            acquiredTuples={partitionedTuples[1]}
            onRepartition={handleRepartition}
        />
    );
};

export default Shop;
