import { makeStyles } from "@mui/styles";
import Dispatcher from "data/dispatcher";
import RecipeActions from "data/RecipeActions";
import React from "react";
import ImageDropZone from "util/ImageDropZone";
import { BfsId } from "../../../global/types/types";

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
    recipeId: BfsId
    disabled: boolean
}

const ItemImageUpload: React.FC<Props> = ({
                                              recipeId,
                                              disabled,
                                          }) => {
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
