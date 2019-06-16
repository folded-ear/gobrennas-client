import RecipeAdd from '../views/RecipeAdd'
import {Container} from "flux/utils";
import React from "react";
import RecipeStore from "../data/RecipeStore";

export default Container.createFunctional(
    props => <RecipeAdd {...props}/>,
    () => [
        RecipeStore
    ],
    () => {
        return {
            pantryItems: RecipeStore.getPantryItems()
        };
    }
);