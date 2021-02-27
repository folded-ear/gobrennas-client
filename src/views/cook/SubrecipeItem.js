import {
    Grid,
    Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import useIngredientLO from "../../data/useIngredientLO";
import { refType } from "../../models/IngredientRef";
import CollapseIconButton from "../plan/CollapseIconButton";
import IngredientDirectionsRow from "./IngredientDirectionsRow";

const SubrecipeItem = ({ingredient: ref, loggedIn}) => {
    const [expanded, setExpanded] = React.useState(false);
    const iLO = useIngredientLO(ref.ingredientId);
    if (!iLO.done() || !iLO.hasValue()) return null;
    const ing = iLO.getValueEnforcing();
    if (ing.type !== "Recipe") return null;
    return <>
        <Grid item xs={12}>
            <Typography variant="h5">
                <CollapseIconButton
                    expanded={expanded}
                    onClick={() => setExpanded(s => !s)}
                />
                <span
                    onClick={() => setExpanded(s => !s)}
                    style={{
                        cursor: "pointer",
                    }}
                >
                    {ing.name}
                </span>
            </Typography>
        </Grid>
        {expanded && <IngredientDirectionsRow
            loggedIn={loggedIn}
            recipe={ing}
            hideHeadings
        />}
    </>;
};

SubrecipeItem.propTypes = {
    ingredient: refType.isRequired,
    loggedIn: PropTypes.bool,
};

export default SubrecipeItem;
