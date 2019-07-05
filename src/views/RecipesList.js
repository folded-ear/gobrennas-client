import React from 'react';
import {Link} from 'react-router-dom';
import {Spin} from "antd";

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
                <Link to={`/recipe/${recipe.ingredientId}`} key={recipe.ingredientId}>
                    {recipe.title}
                </Link>
            ))}
        </div>
    );
}

export default RecipesList;