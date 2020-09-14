import { Container } from "flux/utils";
import React from "react";
import PlanStore from "../data/PlanStore";
import ShoppingStore from "../data/ShoppingStore";
import {
    isParent,
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
        .map(lo => ({
            ...lo.getValueEnforcing(),
            lo,
        }))
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
        const byUnit = groupBy(
            items.filter(it => it.status === TaskStatus.NEEDED),
            it => it.uomId);
        const quantities = [];
        for (const uomId of byUnit.keys()) {
            quantities.push({
                quantity: byUnit.get(uomId)
                    .reduce((q, it) => q + it.quantity, 0),
                // todo: get the uom name?
                uomId,
            });
        }
        theTree.push({
            _type: "ingredient",
            id: ingId,
            itemIds: items.map(it => it.id),
            // todo: get the ing name...
            name: `ingredient#${ingId}`,
            quantities,
        });
        // todo: if expanded...
        theTree.push(...items.map(it => ({
            _type: "item",
            ...it,
        })));
    }
    // add the garbage at the bottom
    theTree.push(...unparsed.map(it => ({
        _type: "raw",
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
