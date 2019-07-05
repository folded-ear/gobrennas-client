import React from 'react';
import {Link} from "react-router-dom";
import {
    Button,
    Spin,
} from "antd";
import IngredientItem from "./IngredientItem";
import RecipeApi from "../data/RecipeApi";

const handleDelete = (id) => {
    RecipeApi.deleteRecipe(id);
};

const RecipeDetail = ({recipeLO}) => {
    
    if (!recipeLO.hasValue()) {
        return <Spin tip="Recipe is loading..."/>
    }
    
    const recipe = recipeLO.getValueEnforcing();
    
    return (
        <div>
            <Link to="/library">X Close</Link>
            <h3>{recipe.title}</h3>
            <h5>Source</h5>
            <p>{recipe.external_url}</p>
            
            <h5>Ingredients</h5>
            <div>{recipe.ingredients.map(ingredient => {
                return (
                    <IngredientItem key={ingredient.id} ingredient={ingredient}/>
                )
            })}</div>
            
            <h5>Raw Ingredients</h5>
            <p>{recipe.rawIngredients}</p>
            
            <h5>Preparation</h5>
            <p>{recipe.directions}</p>
            
            <Button type="danger" onClick={() => handleDelete(recipe.ingredientId)}>Delete Recipe</Button>
        </div>
    )
};

export default RecipeDetail;