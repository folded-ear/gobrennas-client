import React from 'react'
import {Container} from 'flux/utils';
import {withRouter} from 'react-router-dom';
import RecipeDetail from '../views/RecipeDetail';
import RecipeStore from '../data/RecipeStore';
import LibraryStore from "../data/LibraryStore";

export default withRouter(Container.createFunctional(
    (props) => <RecipeDetail {...props}/>,
    () => [
        LibraryStore,
        RecipeStore
    ],
    (prevState, props, context) => {
        const { match } = props;
        const recipeLO = LibraryStore.getRecipeById(1);
        console.log(recipeLO)
        return {
            recipeLO
        }
    },
    { withProps: true }
));