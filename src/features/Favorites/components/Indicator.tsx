import React from "react";
import { FavoriteIcon, NotFavoriteIcon } from "@/views/common/icons";
import {
    useIsFavorite,
    useMarkFavorite,
    useRemoveFavorite,
} from "../data/queries";
import { BfsId } from "@/global/types/identity";
import { TaskBarButton } from "@/global/elements/taskbar.elements";

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
        <TaskBarButton edge="start" size="small" onClick={handleClick}>
            {favorite ? <FavoriteIcon /> : <NotFavoriteIcon />}
        </TaskBarButton>
    );
};

export default Indicator;
