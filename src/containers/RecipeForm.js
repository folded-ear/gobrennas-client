import { Container } from 'flux/utils';
import React from 'react';
import DraftRecipeStore from '../data/DraftRecipeStore';
import RecipeForm from '../views/RecipeForm';

export default Container.createFunctional(
    (props) => <RecipeForm {...props}/>,
    () => [
        DraftRecipeStore
    ],
    (prevState, props) => {
        return {
            draft: DraftRecipeStore.getDraftLO(),
            ...props
        };
    },
    { withProps: true}
);