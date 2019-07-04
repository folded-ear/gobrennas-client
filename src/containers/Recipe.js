import React from 'react'
import {Container} from 'flux/utils';
import RecipeDetail from '../views/RecipeDetail';
import RecipeStore from '../data/RecipeStore';

export default Container.createFunctional(
    (props) => <RecipeDetail {...props}/>,
    () => [
        RecipeStore
    ],
    () => {
        return {
            recipes: RecipeStore.getState(),
        }
    }
);