import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Modal,
    Paper,
    TextField,
    Tooltip,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Share } from "@mui/icons-material";
import BaseAxios from "axios";
import React from "react";
import {
    API_BASE_URL,
    APP_BASE_URL,
} from "constants/index";
import type {
    Recipe,
    SharedRecipe,
} from "features/RecipeDisplay/types";
import {
    emptyRLO,
    RippedLO,
} from "util/ripLoadObject";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const useStyles = makeStyles(theme => {
    const width = 500;
    return {
        modal: {
            width: `${width}px`,
            position: "absolute",
            top: 100,
            left: `calc(50% - ${width / 2}px)`,
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
        },
        title: {
            marginTop: 0,
        }
    };
});

type ShareRecipeProps = {
    recipe: Recipe
}
const ShareRecipe : React.FC<ShareRecipeProps> = ({recipe}) => {
    const classes = useStyles();
    const [ open, setOpen ] = React.useState(false);
    const [ rlo, setRlo ] = React.useState<RippedLO<SharedRecipe>>(emptyRLO());
    React.useEffect(
        () => {
            if (!open) {
                return;
            }
            if (rlo.data && rlo.data.id === recipe.id) {
                return;
            }
            setRlo({
                ...emptyRLO(),
                loading: true,
                data: {
                    id: recipe.id,
                    slug: "",
                    secret: "",
                },
            });
            axios.get(`/share/${recipe.id}`)
                .then(
                    data => setRlo({
                        ...emptyRLO(),
                        data: data.data,
                    }),
                    error => setRlo({
                        ...emptyRLO(),
                        error,
                    }),
                );
        },
        [ open, rlo, recipe.id ],
    );

    const button = <Tooltip
        title="Share this recipe"
        placement="top"
    >
        <IconButton onClick={() => setOpen(true)} size="large">
            <Share />
        </IconButton>
    </Tooltip>;

    if (!open) {
        return button;
    }

    let body;
    if (rlo.loading || !rlo.data) {
        body = <Box style={{ textAlign: "center" }}>
            <CircularProgress />
        </Box>;
    } else if (rlo.error) {
        body = <div>
            Something went wrong getting a sharable link.
            <div style={{ textAlign: "right" }}>
                <Button
                    onClick={() => setRlo(emptyRLO())}
                >
                    Try Again
                </Button>
            </div>
        </div>;
    } else { // got it!
        const info = rlo.data;
        const shareUrl = `${APP_BASE_URL}/share/recipe/${info.slug}/${info.secret}/${info.id}`;
        body = <>
            <p>Share this link to allow non-users to access your recipe:
            </p>
            <TextField
                value={shareUrl}
                fullWidth
                onFocus={e => e.target.select()}
                autoFocus
            />
        </>;
    }

    return <>
        {button}
        <Modal
            open
            onClose={() => setOpen(false)}
        >
            <Paper
                className={classes.modal}
                elevation={8}
            >
                <h2 className={classes.title}>Share Recipe</h2>
                {body}
            </Paper>
        </Modal>
    </>;
};

export default ShareRecipe;
