import React, {
    useEffect
} from 'react';

import RecipeActions from '../data/RecipeActions';

function Landing() {
    
    useEffect(() => {
        RecipeActions.fetchRecipes();
        RecipeActions.fetchPantryItems()
    });
    
    return (
        <div className="Home">
            <h1>Welcome to Foodinger</h1>
        </div>
    );
}

export default Landing;
