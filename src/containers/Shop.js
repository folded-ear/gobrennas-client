import { Container } from "flux/utils";
import React from "react";
import PlanStore from "../data/PlanStore";
import ShoppingStore from "../data/ShoppingStore";
import {
    isParent,
    isQuestionable,
    isSection,
} from "../data/tasks";
import TaskStatus from "../data/TaskStatus";
import groupBy from "../util/groupBy";
import ShopList from "../views/shop/ShopList";

const gatherLeaves = item => {
    if (!isParent(item)) return [{
        ...item,
        path: [],
    }];
    return PlanStore.getChildItemLOs(item.id)
        .filter(lo => lo.hasValue())
        .map(lo => {
            const item = lo.getValueEnforcing();
            return {
                ...item,
                question: isQuestionable(item),
                pending: !lo.isDone(),
                deleting: lo.isDeleting() && item._next_status === TaskStatus.DELETED,
                completing: lo.isDeleting() && item._next_status === TaskStatus.COMPLETED,
                acquiring: lo.isUpdating() && item._next_status === TaskStatus.ACQUIRED,
            };
        })
        .filter(it => !isSection(it))
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
    if (byIngredient.has(undefined)) {
        unparsed = byIngredient.get(undefined)
            .filter(it => it.status === TaskStatus.NEEDED);
        byIngredient.delete(undefined);
    }
    const theTree = [];
    // todo: sort by ingredient order...
    for (const [ingId, items] of byIngredient) {
        const neededItems = items.filter(it => it.status === TaskStatus.NEEDED);
        if (neededItems.length === 0) continue;
        const byUnit = groupBy(neededItems, it => it.uomId);
        const quantities = [];
        for (const uomId of byUnit.keys()) {
            quantities.push({
                quantity: byUnit.get(uomId)
                    .reduce((q, it) => q + it.quantity, 0),
                // todo: get the uom name?
                uomId,
            });
        }
        const expanded = ShoppingStore.isIngredientExpanded(ingId);
        theTree.push({
            _type: "ingredient",
            id: ingId,
            itemIds: items.map(it => it.id),
            // todo: get the ing name...
            name: `ingredient#${ingId}`,
            quantities,
            expanded,
            pending: items.some(it => it.pending),
            acquiring: items.every(it => it.acquiring || it.status === TaskStatus.ACQUIRED),
            deleting: items.every(it => it.deleting || it.status === TaskStatus.DELETED),
        });
        if (expanded) {
            theTree.push(...items.map(it => ({
                _type: "item",
                depth: 1,
                ...it,
            })));
        }
    }
    // add the garbage at the bottom
    theTree.push(...unparsed.map(it => ({
        _type: "raw",
        depth: 0,
        ...it,
    })));
    return theTree;
};

export default Container.createFunctional(
    props => <ShopList {...props} />,
    () => [
        PlanStore,
        ShoppingStore,
    ],
    () => {
        const allPlans = ShoppingStore.getAllPlans();
        const activeItem = ShoppingStore.getActiveItem();
        return {
            allPlans,
            itemTuples: allPlans.hasValue()
                ? groupItems(allPlans.getValueEnforcing()
                    .filter(p => p.selected))
                : [],
            isActive: activeItem == null
                ? () => false
                : itemOrId => (itemOrId.id || itemOrId) === activeItem.id,
        };
    }
);
