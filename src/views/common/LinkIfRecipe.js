import {
    IconButton,
    Tooltip,
} from "@material-ui/core";
import { Kitchen } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import useIngredientLO from "../../data/useIngredientLO";
import history from "../../util/history";

const LinkIfRecipe = ({id, ...props}) => {
    const lo = useIngredientLO(id);
    if (!lo || !lo.hasValue()) return null;
    const ing = lo.getValueEnforcing();
    if (ing.type !== "Recipe") return null;
    return (
        <Tooltip
            title="Jump to Recipe in Library"
            placement="top"
        >
            <IconButton
                onClick={() => history.push(`/library/recipe/${ing.id}`)}
                {...props}
            >
                <Kitchen />
            </IconButton>
        </Tooltip>
    );
};

LinkIfRecipe.propTypes = {
    id: PropTypes.number.isRequired,
};

export default LinkIfRecipe;
