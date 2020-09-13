import { Container } from "flux/utils";
import React from "react";
import PlanStore from "../data/PlanStore";
import ShoppingStore from "../data/ShoppingStore";
import ShopList from "../views/shop/ShopList";

export default Container.createFunctional(
    props => <ShopList {...props} />,
    () => [
        PlanStore,
        ShoppingStore,
    ],
    () => {
        return {
            allPlans: ShoppingStore.getAllPlans(),
        };
    }
);
