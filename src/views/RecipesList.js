import React from 'react';
import { Link } from 'react-router-dom';
import { Spin } from "antd";

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
                    <Link to={`/library/recipe/${recipe.ingredientId}`}>{recipe.name}</Link>
                </h2>
            ))}
            {library.length === 0  && <em>No recipes yet...</em>}
        </div>
    );
};

export default RecipesList;