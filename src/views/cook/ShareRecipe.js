import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Modal,
    Paper,
    Tooltip,
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Share } from "@material-ui/icons";
import BaseAxios from "axios";
import React from "react";
import { API_BASE_URL } from "../../constants";
import { Recipe } from "../../data/RecipeTypes";
import LoadObject from "../../util/LoadObject";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/share/recipe`,
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

const ShareRecipe = ({recipe}) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(true); // todo: set back!
    const [lo, setLo] = React.useState(LoadObject.empty());
    React.useEffect(
        () => {
            if (!open) {
                console.log("not open")
                return;
            }
            if (lo.hasValue() && lo.getValue().id === recipe.id) {
                console.log("already got this recipe's deets")
                return;
            }
            setLo(LoadObject.loading().setValue({
                id: recipe.id,
            }));
            console.log("do load....")
            axios.get(`/for/${recipe.id}`)
                .then(
                    data => setLo(lo => lo.done().map(v => ({
                        ...v,
                        ...data.data,
                    }))),
                    err => setLo(lo => lo.done().setError(err)),
                );
        },
        [open, lo, recipe.id],
    );

    const button = <Tooltip
        title="Share this recipe"
        placement="top"
    >
        <IconButton
            onClick={() => setOpen(true)}
        >
            <Share />
        </IconButton>
    </Tooltip>;

    if (!open) {
        return button;
    }

    let body;
    if (lo.isLoading() || !lo.hasValue()) {
        body = <Box style={{textAlign: "center"}}>
            <CircularProgress />
        </Box>;
    } else if (lo.hasError()) {
        body = <div>
            Something went wrong getting a sharable link.
            <div style={{textAlign: "right"}}>
                <Button
                    onClick={() => setLo(LoadObject.empty())}
                >
                    Try Again
                </Button>
            </div>
        </div>;
    } else { // got it!
        body = <pre>
            {JSON.stringify(lo.getValueEnforcing(), null, 3)}
        </pre>;
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

ShareRecipe.propTypes = {
    recipe: Recipe.isRequired,
};

export default ShareRecipe;
