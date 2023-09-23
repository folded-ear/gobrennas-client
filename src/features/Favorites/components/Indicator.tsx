import React from "react";
import {
  Star,
  StarBorder
} from "@mui/icons-material";
import {
  useIsFavorite,
  useMarkFavorite,
  useRemoveFavorite
} from "../data/queries";
import { BfsId } from "../../../global/types/types";
import IconButton from "@mui/material/IconButton";

interface Props {
    type: string;
    id: BfsId;
}

const Indicator: React.FC<Props> = ({ type, id }) => {
    const removeFavorite = useRemoveFavorite(type);
    const markFavorite = useMarkFavorite(type);
    const isFavorite = useIsFavorite();
    const favorite = isFavorite(id);

    function handleClick(e) {
        e.stopPropagation();
        e.preventDefault();
        if (favorite) {
            removeFavorite(id);
        } else {
            markFavorite(id);
        }
    }

    return (
        <IconButton edge={"start"} size={"small"} onClick={handleClick}>
            {favorite ? <Star /> : <StarBorder />}
        </IconButton>
    );
};

export default Indicator;
