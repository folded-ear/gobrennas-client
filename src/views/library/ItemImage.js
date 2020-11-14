import React from "react";
import {CardMedia} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Recipe} from "../../data/RecipeTypes";

const useStyles = makeStyles({
    photo: {
        height: 140,
    },
});

const ItemImage = ({recipe}) => {
    const classes = useStyles();

    return (<CardMedia
        className={classes.photo}
        image={recipe.photo}
        title={recipe.name}
    />);
};

ItemImage.propTypes = {
    recipe: Recipe
};

export default ItemImage;
