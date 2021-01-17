import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import { Recipe } from "../../data/RecipeTypes";
import ImageDropZone from "../../util/ImageDropZone";

const useStyles = makeStyles({
    root: {
        display: "block",
        height: 140,
        textAlign: "center",
        paddingTop: "30px",
        backgroundColor: "#eee"
    },
});

const ItemImageUpload = ({recipe}) => {
    const classes = useStyles();
    return <ImageDropZone
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
};

export default ItemImageUpload;
