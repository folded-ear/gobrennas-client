import React, {PureComponent} from 'react';
import Dispatcher from '../data/dispatcher';
import RecipeActions from '../data/RecipeActions'
import {Spin} from "antd";


class RecipesList extends PureComponent<{}> {
    
    onSelect = (id) => {
        Dispatcher.dispatch({
            type: RecipeActions.SELECT_RECIPE,
            data: id
        })
    };
    
    render() {
        const {libraryLO} = this.props;
        
        if (!libraryLO.hasValue()) {
            return <Spin tip="Loading recipe library..."/>
        }
        
        const library = libraryLO.getValueEnforcing();
        return (
            <div className="recipes-list">
                <h1>Recipes</h1>
                {[...library].reverse().map(recipe => (
                    <h2
                        key={recipe.ingredientId}
                        onClick={() => this.onSelect(recipe.ingredientId)}
                    >
                        {recipe.title}
                    </h2>
                ))}
            </div>
        );
    }
}

export default RecipesList;