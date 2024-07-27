import { makeStyles } from "@mui/styles";
import React from "react";
import ImageDropZone from "util/ImageDropZone";
import { BfsId } from "global/types/identity";
import { gql } from "../../../__generated__";
import { useMutation } from "@apollo/client";
import promiseWellSizedFile from "../../../util/promiseWellSizedFile";

const SET_RECIPE_PHOTO = gql(`
mutation setRecipePhoto($id: ID!, $photo: Upload!) {
  library {
    setRecipePhoto(id: $id, photo: $photo) {
      id
      photo {
        url
        focus
      }
    }
  }
}`);

const useStyles = makeStyles({
    root: {
        display: "block",
        height: 140,
        textAlign: "center",
        paddingTop: "30px",
    },
});

interface Props {
    recipeId: BfsId;
    disabled: boolean;
}

const ItemImageUpload: React.FC<Props> = ({ recipeId, disabled }) => {
    const classes = useStyles();
    const [setRecipePhoto] = useMutation(SET_RECIPE_PHOTO);
    const handlePhoto = async (photo) => {
        if (!(photo instanceof File)) {
            throw new Error("Non-File photo? Huh?");
        }
        photo = await promiseWellSizedFile(photo);
        setRecipePhoto({
            variables: {
                id: "" + recipeId,
                photo,
            },
        });
    };
    return (
        <ImageDropZone
            disabled={disabled}
            className={classes.root}
            onImage={handlePhoto}
        />
    );
};

export default ItemImageUpload;
