import { CardMedia } from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { Recipe } from "../../data/RecipeTypes";

const ItemImage = ({recipe, style, ...props}) => {
    const x = recipe.focus ? recipe.focus[0] * 100 : 50;
    const y = recipe.focus ? recipe.focus[1] * 100 : 50;

    return (<CardMedia
        image={recipe.photo}
        title={recipe.name}
        {...props}
        style={{
            ...style,
            backgroundPosition: `${x == null ? 50 : x}% ${y == null ? 50 : y}%`
        }}
    />);
};

ItemImage.propTypes = {
    recipe: Recipe.isRequired,
    style: PropTypes.object,
};

export default ItemImage;
