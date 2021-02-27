import {
    Divider,
    Grid,
    Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { Recipe } from "../../data/RecipeTypes";
import CollapseIconButton from "../plan/CollapseIconButton";
import IngredientDirectionsRow from "./IngredientDirectionsRow";

const SubrecipeItem = ({recipe, loggedIn}) => {
    const [expanded, setExpanded] = React.useState(false);
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
                    {recipe.name}
                </span>
            </Typography>
        </Grid>
        {expanded && <>
            <IngredientDirectionsRow
                loggedIn={loggedIn}
                recipe={recipe}
                hideHeadings
            />
            <Grid item xs={12}>
                <Divider
                    variant={"middle"}
                />
            </Grid>
        </>}
    </>;
};

SubrecipeItem.propTypes = {
    recipe: Recipe.isRequired,
    loggedIn: PropTypes.bool,
};

export default SubrecipeItem;
