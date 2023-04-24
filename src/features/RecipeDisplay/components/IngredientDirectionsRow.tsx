import {
    Button,
    ButtonGroup,
    Grid,
    List,
    ListItem,
    Typography,
} from "@mui/material";
import React from "react";
import Directions from "views/common/Directions";
import IngredientItem from "views/IngredientItem";
import type { Recipe } from "features/RecipeDisplay/types";
import { useScaleOptions } from "util/ScalingContext";

interface Props {
    recipe: Recipe,
    loggedIn?: boolean,
    hideHeadings?: boolean,
}

const IngredientDirectionsRow: React.FC<Props> = ({
                                                      recipe,
                                                      loggedIn,
                                                      hideHeadings,
                                                  }) => {
    const scaleOpts = useScaleOptions();
    return <>
        <Grid item xs={12} sm={5}>
            {recipe.ingredients && recipe.ingredients.length > 0 && <>
                {!hideHeadings && <Grid container justifyContent={"space-between"}>
                    <Typography variant="h5">
                        Ingredients
                    </Typography>
                    <ButtonGroup
                        size="small"
                        variant="text"
                        color={"inherit"}
                    >
                        {scaleOpts.map(opt => {
                            return <Button
                                key={opt.value}
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    opt.select();
                                }}
                                variant={opt.active ? "contained" : undefined}
                            >
                                {opt.label}
                            </Button>;
                        })}
                    </ButtonGroup>
                </Grid>}
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
};

export default IngredientDirectionsRow;
