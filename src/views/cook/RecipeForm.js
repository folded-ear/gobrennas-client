import {
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    Grid,
    IconButton,
    List,
    ListItem,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Add,
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
import useDraftRecipeLO from "../../data/useDraftRecipeLO";
import useWindowSize from "../../data/useWindowSize";
import ImageDropZone from "../../util/ImageDropZone";
import TextractFormAugment from "./TextractFormAugment";
import ElEdit from "../ElEdit";
import PositionPicker from "../PositionPicker";

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
}));

const updateDraft = (key, value) => {
    Dispatcher.dispatch({
        type: RecipeActions.DRAFT_RECIPE_UPDATED,
        data: {key, value},
    });
};

const handleUpdate = (e) => {
    const {name: key, value} = e.target;
    updateDraft(key, value);
};

const handleNumericUpdate = (e) => {
    const {name: key, value} = e.target;
    const v = parseFloat(value);
    updateDraft(key, isNaN(v) ? null : v);
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

const RecipeForm = ({title, onSave, onSaveCopy, onCancel, extraButtons}) => {
    const lo = useDraftRecipeLO();
    const windowSize = useWindowSize();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("xs"));
    const classes = useStyles();
    const draft = lo.getValueEnforcing();
    const MARGIN = 2;

    return <>
        <Typography
            variant="h2">{title}</Typography>
        {lo.hasOperation() && <CircularProgress />}
        <TextractFormAugment
            renderActions={lines => {
                const disabled = !(lines && lines.length);
                return <ButtonGroup>
                    <Button
                        onClick={() => updateDraft("name", lines[0])}
                        disabled={disabled || lines.length > 1}
                    >
                        Set Title
                    </Button>
                    <Button
                        onClick={() => Dispatcher.dispatch({
                            type: RecipeActions.MULTI_LINE_DRAFT_INGREDIENT_PASTE_YO,
                            index: 999999,
                            text: lines.map(s => s.trim())
                                .filter(s => s.length)
                                .join("\n"),
                        })}
                        disabled={disabled}
                    >
                        Add Ingredients
                    </Button>
                    <Button
                        onClick={() => updateDraft(
                            "directions",
                            (draft.directions + "\n\n" + lines.join("\n")).trim(),
                        )}
                        disabled={disabled}
                    >
                        Add Description
                    </Button>
                </ButtonGroup>;
            }}
        />
        <Box my={MARGIN}>
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
        <Box my={MARGIN}>
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
        <Box my={MARGIN}>
            <Grid container>
                {draft.photo && <Grid item>
                    <PositionPicker
                        image={draft.photo}
                        value={draft.photoFocus}
                        onChange={pos => updateDraft("photoFocus", pos)}
                    />
                </Grid>}
                <Grid item>
                    <ImageDropZone
                        onImage={file => updateDraft("photo", file)}
                        style={{
                            display: "inline-block",
                            backgroundColor: "#eee",
                            textAlign: "center",
                            cursor: "pointer",
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
        <List>
            {draft.ingredients.map((it, i) =>
                <ListItem key={i} disableGutters>
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
                    <div style={{marginLeft: "auto", whiteSpace: "nowrap"}}>
                        {!mobile && <IconButton
                            size="small"
                            tabIndex={-1}
                            onClick={() => Dispatcher.dispatch({
                                type: RecipeActions.NEW_DRAFT_INGREDIENT_YO,
                                index: i,
                            })}
                        >
                            <Add />
                        </IconButton>}
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
        <Box my={MARGIN}>
            <TextField
                name="directions"
                label="Directions"
                multiline
                rows={6}
                rowsMax={(windowSize.height - 75) / 2 / 18 /* aiming for something around 50vh */}
                value={draft.directions}
                onChange={handleUpdate}
                placeholder="Recipe Directions"
                fullWidth
                variant="outlined"
            />
        </Box>
        <Box my={MARGIN}>
            <Grid container spacing={2}>
                <Grid item sm={4}>
                    <TextField
                        name="yield"
                        label="Yield"
                        fullWidth
                        placeholder="Yield (in servings)"
                        value={draft.yield == null ? "" : draft.yield}
                        onChange={handleNumericUpdate}
                        variant="outlined"
                    />
                </Grid>
                <Grid item sm={4}>
                    <TextField
                        name="totalTime"
                        label="Total Cook Time"
                        fullWidth
                        placeholder="Total Time In Minutes"
                        value={draft.totalTime == null ? "" : draft.totalTime}
                        onChange={handleNumericUpdate}
                        variant="outlined"
                    />
                </Grid>
                <Grid item sm={4}>
                    <TextField
                        name="calories"
                        label="Calories"
                        fullWidth
                        placeholder="Calories Per Serving"
                        value={draft.calories == null ? "" : draft.calories}
                        onChange={handleNumericUpdate}
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        </Box>
        <Box my={MARGIN}>
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
        <Grid container justify={"space-between"}>
            <Grid item>
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
                    color="secondary"
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
            </Grid>
            {extraButtons && <Grid item>
                {extraButtons}
            </Grid>}
        </Grid>
    </>;
};

RecipeForm.propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func,
    onSaveCopy: PropTypes.func,
    onCancel: PropTypes.func,
    draft: Recipe,
    extraButtons: PropTypes.node,
};

export default RecipeForm;
