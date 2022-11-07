import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "data/dispatcher";
import RecipeActions from "data/RecipeActions";
import { Recipe } from "data/RecipeTypes";
import ImageDropZone from "util/ImageDropZone";

const useStyles = makeStyles({
    root: {
        display: "block",
        height: 140,
        textAlign: "center",
        paddingTop: "30px",
        backgroundColor: "#eee"
    },
});

const ItemImageUpload = ({recipe, disabled}) => {
    const classes = useStyles();
    return <ImageDropZone
        disabled={disabled}
        className={classes.root}
        onImage={file => Dispatcher.dispatch({
            type: RecipeActions.SET_RECIPE_PHOTO,
            id: recipe.id,
            photo: file,
        })}
    />;
};

ItemImageUpload.propTypes = {
    recipe: Recipe,
    disabled: PropTypes.bool,
};

export default ItemImageUpload;
