import React, {
    useEffect
} from 'react';

import Actions from '../data/actions';

function Landing() {
    
    useEffect(() => {
        Actions.fetchRecipes();
        Actions.fetchPantryItems()
    });
    
    return (
        <div className="Home">
            <h1>Welcome to Foodinger</h1>
        </div>
    );
}

export default Landing;
