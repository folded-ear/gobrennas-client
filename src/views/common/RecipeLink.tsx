import { BfsId } from "@/global/types/identity";
import { LinkIcon } from "@/views/common/icons";
import { IconButton } from "@mui/material";
import { useHistory } from "react-router-dom";

export default function RecipeLink({
    recipe,
}: {
    recipe: { id: BfsId; name: string };
}) {
    const history = useHistory();
    return (
        <IconButton
            size={"small"}
            onClick={() => history.push(`/library/recipe/${recipe.id}`)}
            title={`Open ${recipe.name}`}
        >
            <LinkIcon fontSize="inherit" />
        </IconButton>
    );
}
