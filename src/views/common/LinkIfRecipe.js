import {
    IconButton,
    Tooltip,
} from "@material-ui/core";
import { Kitchen } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import useIngredientLO from "../../data/useIngredientLO";
import history from "../../util/history";

const LinkIfRecipe = ({planId, taskId, ingredientId, ...props}) => {
    const lo = useIngredientLO(ingredientId);
    if (!lo || !lo.hasValue()) return null;
    const ing = lo.getValueEnforcing();
    if (ing.type !== "Recipe") return null;
    return (
        <Tooltip
            title="Cook / Kitchen View"
            placement="top"
        >
            <IconButton
                onClick={() => history.push(`/plan/${planId}/recipe/${taskId}`)}
                {...props}
            >
                <Kitchen />
            </IconButton>
        </Tooltip>
    );
};

LinkIfRecipe.propTypes = {
    planId: PropTypes.number.isRequired,
    taskId: PropTypes.number.isRequired,
    ingredientId: PropTypes.number.isRequired,
};

export default LinkIfRecipe;
