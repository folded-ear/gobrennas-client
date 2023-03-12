import {
    Star,
    StarBorder
} from "@mui/icons-material";
import {
    useIsFavorite,
    useMarkFavorite,
    useRemoveFavorite
} from "../data/queries";
import { IconButton } from "@mui/material";

interface Props {
    type: string,
    id: number,
}

export default function Indicator({
                                      type,
                                      id,
                                  }: Props) {
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

    return <IconButton
        edge={"start"}
        size={"small"}
        onClick={handleClick}
    >
        {favorite ? <Star /> : <StarBorder />}
    </IconButton>;
}
