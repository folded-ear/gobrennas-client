import RecipeAdd from '../views/RecipeAdd'
import {Container} from "flux/utils";
import React from "react";
import PantryItemStore from "../data/PantryItemStore";

export default Container.createFunctional(
    props => <RecipeAdd {...props} />,
    () => [
        PantryItemStore
    ],
    () => {
        return {
            pantryItems: PantryItemStore.getPantryItems()
        };
    }
);