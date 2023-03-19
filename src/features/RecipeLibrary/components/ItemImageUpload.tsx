import {makeStyles} from "@mui/styles";
import Dispatcher from "data/dispatcher";
import RecipeActions from "data/RecipeActions";
import React from "react";
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

interface Props {
    recipeId: string | number,
    disabled: boolean,
}

const ItemImageUpload = ({recipeId, disabled}: Props) => {
    const classes = useStyles();
    return <ImageDropZone
        disabled={disabled}
        className={classes.root}
        onImage={file => Dispatcher.dispatch({
            type: RecipeActions.SET_RECIPE_PHOTO,
            id: recipeId,
            photo: file,
        })}
    />;
};

export default ItemImageUpload;
