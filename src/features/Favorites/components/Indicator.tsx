import {IconButton} from "@material-ui/core";
import {Star, StarBorder} from "@material-ui/icons";
import {useIsFavorite, useMarkFavorite, useRemoveFavorite} from "../data/queries";

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
