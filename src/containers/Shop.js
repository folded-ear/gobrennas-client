import { Container } from "flux/utils";
import React from "react";
import LibraryStore from "../data/LibraryStore";
import ShoppingStore from "../data/ShoppingStore";
import {
    isParent,
    isQuestionable,
    isSection,
} from "../data/tasks";
import TaskStatus from "../data/TaskStatus";
import TaskStore from "../data/TaskStore";
import groupBy from "../util/groupBy";
import ShopList from "../views/shop/ShopList";

const gatherLeaves = item => {
    if (!isParent(item)) {
        if (isSection(item)) return [];
        return [{
            ...item,
            path: [],
        }];
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
};

const groupItems = plans => {
    const leaves = plans
        .flatMap(gatherLeaves);
    if (plans.length === 1) {
        // kill the final path item; it's pointless
        for (const l of leaves) {
            l.path.splice(l.path.length - 1, 1);
        }
    }
    const byIngredient = groupBy(leaves, it => it.ingredientId);
    let unparsed = [];
    if (byIngredient.has(null)) {
        unparsed = byIngredient.get(null)
            .filter(it => it.status === TaskStatus.NEEDED);
        byIngredient.delete(null);
    }
    const orderedIngredients = [];
    for (const [ingId, items] of byIngredient) {
        orderedIngredients.push({
            id: ingId,
            items: items,
            lo: LibraryStore.getIngredientById(ingId)});
    }
    orderedIngredients.sort(({lo: alo}, {lo: blo}) => {
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
    const theTree = [];
    const expandedId = ShoppingStore.getExpandedIngredientId();
    for (const {id: ingId, items, lo} of orderedIngredients) {
        const neededItems = items.filter(it => it.status === TaskStatus.NEEDED);
        if (neededItems.length === 0) continue;
        const unitLookup = new Map();
        const byUnit = groupBy(neededItems, it => {
            if (it.uomId) {
                unitLookup.set(it.uomId, it.units);
            }
            return it.uomId;
        });
        const quantities = [];
        for (const uomId of byUnit.keys()) {
            quantities.push({
                quantity: byUnit.get(uomId)
                    .reduce((q, it) => q + it.quantity, 0),
                uomId,
                units: unitLookup.get(uomId),
            });
        }
        const expanded = ingId === expandedId;
        theTree.push({
            _type: "ingredient",
            id: ingId,
            itemIds: items.map(it => it.id),
            name: lo.hasValue() ? lo.getValueEnforcing().name : items[0].name,
            quantities,
            expanded,
            loading: lo.isLoading() || items.some(it => it.loading),
            acquiring: items.every(it => it.acquiring || it.status === TaskStatus.ACQUIRED),
            deleting: items.every(it => it.deleting || it.status === TaskStatus.DELETED),
        });
        if (expanded) {
            theTree.push(...items.map(it => ({
                _type: "task",
                depth: 1,
                ...it,
            })));
        }
    }
    // add the garbage at the bottom
    theTree.push(...unparsed.map(it => ({
        _type: "task",
        depth: 0,
        ...it,
    })));
    return theTree;
};

export default Container.createFunctional(
    props => <ShopList {...props} />,
    () => [
        TaskStore,
        ShoppingStore,
        LibraryStore,
    ],
    () => {
        const planLO = TaskStore.getActiveListLO();
        const activeItem = ShoppingStore.getActiveItem();
        return {
            planLO,
            itemTuples: planLO.hasValue()
                ? groupItems([planLO.getValueEnforcing()])
                : [],
            isActive: activeItem == null
                ? () => false
                : it => it.id === activeItem.id && it._type === activeItem.type,
        };
    }
);
