import { gql } from "@/__generated__";
import promiseScratchUpload from "@/data/utils/promiseScratchUpload";
import { BfsId } from "@/global/types/identity";
import ImageDropZone from "@/util/ImageDropZone";
import { useMutation } from "@apollo/client";
import { makeStyles } from "@mui/styles";
import * as React from "react";

const SET_RECIPE_PHOTO = gql(`
mutation setRecipePhoto($id: ID!, $filename: String!) {
  library {
    setRecipePhoto(id: $id, filename: $filename) {
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
    const handlePhoto = async (photo: File) => {
        if (!(photo instanceof File)) {
            throw new Error("Non-File photo? Huh?");
        }
        const filename = await promiseScratchUpload(photo);
        setRecipePhoto({
            variables: {
                id: recipeId,
                filename,
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
