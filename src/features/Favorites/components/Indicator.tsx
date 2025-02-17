import { TaskBarButton } from "@/global/elements/taskbar.elements";
import { BfsId } from "@/global/types/identity";
import { FavoriteIcon, NotFavoriteIcon } from "@/views/common/icons";
import * as React from "react";
import {
    useIsFavorite,
    useMarkFavorite,
    useRemoveFavorite,
} from "../data/queries";

interface Props {
    type: string;
    id: BfsId;
}

const Indicator: React.FC<Props> = ({ type, id }) => {
    const removeFavorite = useRemoveFavorite(type);
    const markFavorite = useMarkFavorite(type);
    const favorite = useIsFavorite(id);

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        if (favorite) {
            removeFavorite(id);
        } else {
            markFavorite(id);
        }
    }

    return (
        <TaskBarButton
            edge="start"
            size="small"
            onClick={handleClick}
            style={{ backgroundColor: "unset" }}
        >
            {favorite ? <FavoriteIcon /> : <NotFavoriteIcon />}
        </TaskBarButton>
    );
};

export default Indicator;
