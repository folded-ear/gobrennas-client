import React from "react";
import {withRouter} from "react-router-dom";
import useIngredientLO from "data/useIngredientLO";
import RecipeEdit from "../features/RecipeEdit/RecipeEdit";

export default withRouter(({match}) => {
    const id = parseInt(match.params.id, 10);
    const lo = useIngredientLO(id);
    return <RecipeEdit recipeLO={lo} />;
});
