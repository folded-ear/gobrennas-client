import { makeStyles } from "@mui/styles";
import React from "react";
import ImageDropZone from "@/util/ImageDropZone";
import { BfsId, ensureString } from "@/global/types/identity";
import { gql } from "@/__generated__";
import { useMutation } from "@apollo/client";
import promiseWellSizedFile from "@/util/promiseWellSizedFile";

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
        padding: "25px 0",
    },
});

interface Props {
    recipeId: BfsId;
    disabled: boolean;
    notOnPaper?: boolean;
}

const ItemImageUpload: React.FC<Props> = ({ recipeId, ...props }) => {
    const classes = useStyles();
    const [setRecipePhoto] = useMutation(SET_RECIPE_PHOTO);
    const handlePhoto = async (photo) => {
        if (!(photo instanceof File)) {
            throw new Error("Non-File photo? Huh?");
        }
        photo = await promiseWellSizedFile(photo);
        setRecipePhoto({
            variables: {
                id: ensureString(recipeId),
                photo,
            },
        });
    };
    return (
        <ImageDropZone
            className={classes.root}
            onImage={handlePhoto}
            {...props}
        />
    );
};

export default ItemImageUpload;
