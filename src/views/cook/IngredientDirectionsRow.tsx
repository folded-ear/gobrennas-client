import {
    Grid,
    List,
    ListItem,
    Typography,
} from "@mui/material";
import React from "react";
import Directions from "../common/Directions";
import IngredientItem from "../IngredientItem";
import { Recipe } from "../../global/types/types";

interface Props {
    recipe: Recipe,
    loggedIn?: boolean,
    hideHeadings?: boolean,
}

const IngredientDirectionsRow: React.FC<Props> = ({ recipe, loggedIn, hideHeadings }) => <>
    <Grid item xs={12} sm={5}>
        {recipe.ingredients && recipe.ingredients.length > 0 && <>
            {!hideHeadings && <Typography variant="h5">
                Ingredients
            </Typography>}
            <List>
                {recipe.ingredients.map((it, i) =>
                    <ListItem key={i}>
                        <IngredientItem
                            ingRef={it}
                            hideRecipeLink={!loggedIn}
                            hideSendToPlan={!loggedIn}
                        />
                    </ListItem>)}
            </List>
        </>}
    </Grid>

    <Grid item xs={12} sm={7}>
        {recipe.directions && <React.Fragment>
            {!hideHeadings && <Typography variant="h5">Directions</Typography>}
            <Directions text={recipe.directions} />
        </React.Fragment>}
    </Grid>
</>;

export default IngredientDirectionsRow;
