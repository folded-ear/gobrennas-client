import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { ShareIcon } from "../../../views/common/icons";
import BaseAxios from "axios";
import React from "react";
import { API_BASE_URL, APP_BASE_URL } from "constants/index";
import type { Recipe, SharedRecipe } from "global/types/types";
import { RippedLO } from "util/ripLoadObject";
import ModalButton from "../../../views/ModalButton";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

type ShareRecipeProps = {
    recipe: Recipe;
};

const Body: React.FC<ShareRecipeProps> = ({ recipe }) => {
    const [rlo, setRlo] = React.useState<RippedLO<SharedRecipe>>({});
    const [retry, setRetry] = React.useState(0);
    React.useEffect(() => {
        if (rlo.data?.id === recipe.id) {
            return;
        }
        setRlo({
            loading: true,
        });
        axios.get(`/${recipe.id}/share`).then(
            (data) =>
                setRlo({
                    data: data.data,
                }),
            (error) =>
                setRlo({
                    error,
                }),
        );
    }, [rlo.data?.id, recipe.id, retry]);
    if (rlo.error && !rlo.loading) {
        return (
            <div>
                Something went wrong getting a sharable link.
                <div style={{ textAlign: "right" }}>
                    <Button onClick={() => setRetry((r) => r + 1)}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    } else if (rlo.loading || !rlo.data) {
        return (
            <Box style={{ textAlign: "center" }}>
                <CircularProgress />
            </Box>
        );
    } else {
        // got it!
        const info = rlo.data;
        const shareUrl = `${APP_BASE_URL}/share/recipe/${info.slug}/${info.secret}/${info.id}`;
        return (
            <>
                <p>Share this link to allow non-users to access your recipe:</p>
                <TextField
                    value={shareUrl}
                    fullWidth
                    multiline
                    onFocus={(e) => e.target.select()}
                    autoFocus
                />
            </>
        );
    }
};

const ShareRecipe: React.FC<ShareRecipeProps> = ({ recipe }) => {
    return (
        <ModalButton
            buttonTitle="Share this recipe"
            modalTitle="Share Recipe"
            icon={<ShareIcon />}
            render={() => <Body recipe={recipe} />}
        />
    );
};

export default ShareRecipe;
