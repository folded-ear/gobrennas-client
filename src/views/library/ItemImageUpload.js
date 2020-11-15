import { makeStyles } from "@material-ui/core/styles";
import { AddAPhoto } from "@material-ui/icons";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import { Recipe } from "../../data/RecipeTypes";

const useStyles = makeStyles({
    root: {
        display: "block",
        height: 140,
        textAlign: "center",
        paddingTop: "60px",
        backgroundColor: "#eee"
    },
});

const sendOffFirstFile = (files, recipe) => {
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
        sendOffFirstFile(files, recipe);
    };

    const handleFileSelect = event => {
        sendOffFirstFile(event.target.files, recipe);
    };

    const inputId = `file-uploaded-recipe-${recipe.id}`;
    return (
        <label
            htmlFor={inputId}
            className={classes.root}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            title="Drag and drop a photo here to assign it to the recipe."
        >
            <AddAPhoto color="disabled" />
            <input
                id={inputId}
                accept="image/*"
                type="file"
                style={{
                    opacity: 0,
                    height: 0,
                    width: 0,
                }}
                onChange={handleFileSelect}
            />
        </label>);
};

ItemImageUpload.propTypes = {
    recipe: Recipe,
};

export default ItemImageUpload;
