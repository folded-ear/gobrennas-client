import { makeStyles } from "@material-ui/core/styles";
import { AddAPhoto } from "@material-ui/icons";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import { Recipe } from "../../data/RecipeTypes";

const useStyles = makeStyles({
    root: {
        height: 140,
        textAlign: "center",
        paddingTop: "60px",
        backgroundColor: "#eee"
    },
});

const ItemImageUpload = ({recipe}) => {
    const classes = useStyles();

    const handleDragOver = event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = event => {
        event.preventDefault();
        const dt = event.dataTransfer;
        const files = dt.files;
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.type.indexOf("image/") !== 0) continue;
            Dispatcher.dispatch({
                type: RecipeActions.SET_RECIPE_PHOTO,
                id: recipe.id,
                photo: f,
            });
            break;
        }
    };

    return (
        <div
            className={classes.root}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            title="Drag and drop a photo here to assign it to the recipe."
        >
            <AddAPhoto color="disabled" />
        </div>);
};

ItemImageUpload.propTypes = {
    recipe: Recipe,
};

export default ItemImageUpload;
