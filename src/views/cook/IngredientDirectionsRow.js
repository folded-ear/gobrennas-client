import {
    Grid,
    List,
    ListItem,
    Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { Recipe } from "../../data/RecipeTypes";
import Directions from "../common/Directions";
import IngredientItem from "../IngredientItem";

const IngredientDirectionsRow = ({recipe, loggedIn, hideHeadings}) => <>
    <Grid item xs={12} md={5}>
        {recipe.ingredients && recipe.ingredients.length > 0 && <>
            {!hideHeadings && <Typography variant="h5">
                Ingredients
            </Typography>}
            <List>
                {recipe.ingredients.map((it, i) =>
                    <ListItem key={i}>
                        <IngredientItem
                            ingRef={it}
                            loggedIn={loggedIn}
                        />
                    </ListItem>)}
            </List>
        </>}
    </Grid>

    <Grid item xs={12} md={7}>
        {recipe.directions && <React.Fragment>
            {!hideHeadings && <Typography variant="h5">Directions</Typography>}
            <Directions text={recipe.directions} />
        </React.Fragment>}
    </Grid>
</>;

IngredientDirectionsRow.propTypes = {
    recipe: Recipe.isRequired,
    loggedIn: PropTypes.bool,
    hideHeadings: PropTypes.bool,
};

export default IngredientDirectionsRow;
