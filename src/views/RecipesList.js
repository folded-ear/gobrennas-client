import React from 'react';
import {Link} from 'react-router-dom';
import {Spin} from "antd";
import Dispatcher from '../data/dispatcher';
import RecipeActions from "../data/RecipeActions";

const RecipesList = (props: {}) => {
    const {libraryLO} = props;
    
    if (!libraryLO.hasValue()) {
        return <Spin tip="Loading recipe library..."/>
    }
    
    const library = libraryLO.getValueEnforcing();
    return (
        <div className="recipes-list">
            <h1>Recipes</h1>
            {[...library].reverse().map(recipe => (
                <h2 key={recipe.ingredientId}>
                    <Link onClick={ () => Dispatcher.dispatch({ type: RecipeActions.SELECT_RECIPE, id: recipe.ingredientId })} to={`/library/recipe/${recipe.ingredientId}`}>{recipe.displayTitle}</Link>
                </h2>
            ))}
        </div>
    );
}

export default RecipesList;