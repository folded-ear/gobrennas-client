import {
    Box,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    List,
    ListItem,
    TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Add,
    AddAPhoto,
    Cancel,
    Delete,
    FileCopy,
    Save,
} from "@material-ui/icons";
import ChipInput from "material-ui-chip-input";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import { Recipe } from "../../data/RecipeTypes";
import ElEdit from "../ElEdit";

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
}));

const handleFileUpdate = (e) => {
    const {name: key, files} = e.target;
    if (files.length) {
        const value = files[0];
        Dispatcher.dispatch({
            type: RecipeActions.DRAFT_RECIPE_UPDATED,
            data: {key, value},
        });
    }
};

const handleUpdate = (e) => {
    const {name: key, value} = e.target;
    Dispatcher.dispatch({
        type: RecipeActions.DRAFT_RECIPE_UPDATED,
        data: {key, value},
    });
};

const addLabel = (label) => {
    Dispatcher.dispatch({
        type: RecipeActions.NEW_DRAFT_LABEL,
        data: label.replace(/\/+/g, "-"),
    });
};

const removeLabel = (label, index) => {
    Dispatcher.dispatch({
        type: RecipeActions.REMOVE_DRAFT_LABEL,
        data: {label, index},
    });
};

const RecipeForm = ({draft: lo, onSave, onSaveCopy, onCancel}) => {
    const classes = useStyles();
    const draft = lo.getValueEnforcing();
    const MARGIN = 2;
    let photoName, photoUrl, onPhotoUrlLoad;
    if (draft.photo) {
        if (typeof draft.photo === "string") {
            const p = draft.photo.split("/");
            photoName = p[p.length - 1];
            photoUrl = draft.photo;
        } else {
            photoName = draft.photo.name;
            photoUrl = URL.createObjectURL(draft.photo);
            onPhotoUrlLoad = () => URL.revokeObjectURL(photoUrl);
        }
    }

    const form = (
        <>
            <Box m={MARGIN}>
                <TextField
                    name="name"
                    fullWidth
                    variant="outlined"
                    placeholder="Recipe Title"
                    label="Title"
                    value={draft.name}
                    onChange={handleUpdate}
                />
            </Box>
            <Box m={MARGIN}>
                <TextField
                    name="externalUrl"
                    fullWidth
                    variant="outlined"
                    placeholder="External URL"
                    value={draft.externalUrl}
                    label="External URL"
                    onChange={handleUpdate}
                />
            </Box>
            <Box m={MARGIN}>
                <label
                    htmlFor="photo"
                    style={{
                        display: "inline-block",
                        backgroundColor: "#eee",
                        textAlign: "center",
                    }}
                >
                    {draft.photo
                        ? <img
                            src={photoUrl}
                            alt={photoName}
                            onLoad={onPhotoUrlLoad}
                            style={{
                                maxWidth: "400px",
                                maxHeight: "200px",
                            }}
                        />
                        : <AddAPhoto
                            color="disabled"
                            style={{
                                margin: "30px 40px",
                            }}
                        />}
                    <input
                        id="photo"
                        name="photo"
                        accept="image/*"
                        type="file"
                        style={{
                            opacity: 0,
                            height: 0,
                            width: 0,
                        }}
                        onChange={handleFileUpdate}
                    />
                </label>
            </Box>
            <List>
                {draft.ingredients.map((it, i) =>
                    <ListItem key={i}>
                        <ElEdit
                            name={`ingredients.${i}`}
                            value={it}
                            onChange={handleUpdate}
                            onMultilinePaste={text => Dispatcher.dispatch({
                                type: RecipeActions.MULTI_LINE_DRAFT_INGREDIENT_PASTE_YO,
                                index: i,
                                text,
                            })}
                            onPressEnter={() => Dispatcher.dispatch({
                                type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
                                index: i,
                            })}
                            onDelete={() => Dispatcher.dispatch({
                                type: RecipeActions.KILL_DRAFT_INGREDIENT_YO,
                                index: i,
                            })}
                        />
                        <div style={{marginLeft: "auto"}}>
                            <IconButton
                                size="small"
                                tabIndex={-1}
                                onClick={() => Dispatcher.dispatch({
                                    type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
                                    index: i,
                                })}
                            >
                                <Add />
                            </IconButton>
                            <IconButton
                                size="small"
                                tabIndex={-1}
                                onClick={() => Dispatcher.dispatch({
                                    type: RecipeActions.KILL_DRAFT_INGREDIENT_YO,
                                    index: i,
                                })}
                            >
                                <Delete />
                            </IconButton>
                        </div>
                    </ListItem>)}
            </List>
            <Box m={MARGIN}>
                <Button
                    className={classes.button}
                    startIcon={<Add />}
                    color="secondary"
                    variant="contained"
                    onClick={() => Dispatcher.dispatch({
                        type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
                    })}
                >
                    Add Ingredient
                </Button>
            </Box>
            <Box m={MARGIN}>
                <TextField
                    name="directions"
                    label="Directions"
                    multiline
                    rows={6}
                    value={draft.directions}
                    onChange={handleUpdate}
                    placeholder="Recipe Directions"
                    fullWidth
                    variant="outlined"
                />
            </Box>
            <Box m={MARGIN}>
                <Grid container spacing={2}>
                    <Grid item sm={4}>
                        <TextField
                            name="yield"
                            label="Yield"
                            fullWidth
                            placeholder="Yield (in servings)"
                            value={draft.yield}
                            onChange={handleUpdate}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item sm={4}>
                        <TextField
                            name="totalTime"
                            label="Total Cook Time"
                            fullWidth
                            placeholder="Total Time In Minutes"
                            value={draft.totalTime}
                            onChange={handleUpdate}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item sm={4}>
                        <TextField
                            name="calories"
                            label="Calories"
                            fullWidth
                            placeholder="Calories Per Serving"
                            value={draft.calories}
                            onChange={handleUpdate}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box m={MARGIN}>
                <ChipInput
                    name="labels"
                    value={draft.labels}
                    onAdd={addLabel}
                    onDelete={removeLabel}
                    fullWidth
                    label="Labels"
                    placeholder="Type and press enter to add labels"
                />
            </Box>
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={() => onSave(draft)}
                startIcon={<Save />}
            >
                Save
            </Button>
            {onSaveCopy && <Button
                className={classes.button}
                variant="contained"
                color="primary"
                startIcon={<FileCopy />}
                onClick={() => onSaveCopy(draft)}>
                Save as Copy
            </Button>}
            <Button
                className={classes.button}
                variant="contained"
                color="secondary"
                onClick={() => onCancel(draft)}
                startIcon={<Cancel />}>
                Cancel
            </Button>
        </>
    );

    return lo.isDone()
        ? form
        : <><CircularProgress />{form}</>;
};

RecipeForm.propTypes = {
    onSave: PropTypes.func,
    onSaveCopy: PropTypes.func,
    onCancel: PropTypes.func,
    draft: Recipe,
};

export default RecipeForm;
