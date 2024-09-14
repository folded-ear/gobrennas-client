import {
    AutocompleteChangeReason,
    Box,
    Button,
    Grid,
    IconButton,
    List,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import type { DraftRecipe, Recipe } from "@/global/types/types";
import {
    AddIcon,
    CancelIcon,
    CopyIcon,
    DeleteIcon,
    SaveIcon,
} from "@/views/common/icons";
import React, { ReactNode } from "react";
import useWindowSize from "@/data/useWindowSize";
import ImageDropZone from "@/util/ImageDropZone";
import ElEdit from "@/views/ElEdit";
import PositionPicker from "@/features/RecipeEdit/components/PositionPicker";
import { LabelAutoComplete } from "./LabelAutoComplete";
import DragContainer from "@/features/Planner/components/DragContainer";
import Item from "@/features/Planner/components/Item";
import DragHandle from "@/features/Planner/components/DragHandle";
import { TextractForm } from "@/features/RecipeEdit/components/TextractForm";
import { useRecipeForm } from "@/data/hooks/useRecipeForm";

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
}));

interface Props {
    recipe: Recipe;
    title: string;
    onSave: (r: DraftRecipe) => void;
    onSaveCopy?: (r: DraftRecipe) => void;
    onCancel: (r?: DraftRecipe) => void;
    labelList?: string[];
    extraButtons?: ReactNode;
}

const RecipeForm: React.FC<Props> = ({
    recipe,
    title,
    onSave,
    onSaveCopy,
    onCancel,
    extraButtons,
    labelList,
}) => {
    const windowSize = useWindowSize();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("sm"));
    const classes = useStyles();
    const MARGIN = 2;

    const {
        draft,
        onUpdate,
        onAddIngredientRef,
        onEditIngredientRef,
        onDeleteIngredientRef,
        onMoveIngredientRef,
        onMultilinePasteIngredientRefs,
    } = useRecipeForm(recipe);

    const handleUpdate = React.useCallback(
        (e) => {
            const { name: key, value } = e.target;
            onUpdate(key, value ? value : "");
        },
        [onUpdate],
    );

    const handleNumericUpdate = React.useCallback(
        (e) => {
            const { name: key, value } = e.target;
            const v = parseFloat(value);
            onUpdate(key, isNaN(v) ? null : v);
        },
        [onUpdate],
    );

    const handleLabelChange = (
        e,
        labels: string[],
        reason: AutocompleteChangeReason,
    ) => {
        if (
            reason === "selectOption" ||
            reason === "createOption" ||
            reason === "removeOption"
        ) {
            const val = labels.map((label) => label.replace(/\/+/g, "-"));
            onUpdate("labels", val);
        }
    };

    const updateTextract = (key, value) => {
        onUpdate(key, value);
    };

    const hasPhoto: boolean =
        draft.photoUpload !== null || draft.photoUrl !== null;

    function handleIngredientDrop(
        activeId: number,
        targetId: number,
        vertical: string,
    ) {
        onMoveIngredientRef(activeId, targetId, vertical === "above");
    }

    return (
        <>
            <Typography variant="h2">{title}</Typography>
            <TextractForm
                updateDraft={updateTextract}
                draft={draft}
                onMultilinePaste={onMultilinePasteIngredientRefs}
            />
            <Box my={MARGIN}>
                <TextField
                    name="name"
                    fullWidth
                    variant="outlined"
                    placeholder="Recipe Title"
                    label="Title"
                    value={draft.name || ""}
                    onChange={handleUpdate}
                />
            </Box>
            <Box my={MARGIN}>
                <TextField
                    name="externalUrl"
                    fullWidth
                    variant="outlined"
                    placeholder="External URL"
                    value={draft.externalUrl || ""}
                    label="External URL"
                    onChange={handleUpdate}
                />
            </Box>
            <Box my={MARGIN}>
                <Grid container>
                    {hasPhoto && (
                        <Grid item>
                            <PositionPicker
                                image={
                                    draft.photoUpload
                                        ? draft.photoUpload
                                        : draft.photoUrl
                                }
                                value={draft.photoFocus}
                                onChange={(pos) => onUpdate("photoFocus", pos)}
                            />
                        </Grid>
                    )}
                    <Grid item>
                        <ImageDropZone
                            onImage={(file) => onUpdate("photoUpload", file)}
                            style={{
                                display: "inline-block",
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
            <DragContainer
                onDrop={handleIngredientDrop}
                renderOverlay={(id) => (
                    <Box px={2} py={1}>
                        <DragHandle />
                        {draft.ingredients.find((it) => it.id === id)?.raw ||
                            ""}
                    </Box>
                )}
            >
                <List>
                    {draft.ingredients.map((it, i) => (
                        <Item
                            key={it.id}
                            hideDivider
                            dragId={it.id}
                            suffix={
                                <>
                                    {!mobile && (
                                        <IconButton
                                            size="small"
                                            tabIndex={-1}
                                            onClick={() =>
                                                onEditIngredientRef(i)
                                            }
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        size="small"
                                        tabIndex={-1}
                                        onClick={() => onDeleteIngredientRef(i)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            }
                        >
                            <ElEdit
                                name={`ingredients.${i}`}
                                value={it}
                                onChange={handleUpdate}
                                onMultilinePaste={(text) =>
                                    onMultilinePasteIngredientRefs(i, text)
                                }
                                onPressEnter={() => onAddIngredientRef(i)}
                                onDelete={() => onDeleteIngredientRef(i)}
                                placeholder={
                                    i === 0
                                        ? "E.g., 1 cup onion, diced fine"
                                        : ""
                                }
                            />
                        </Item>
                    ))}
                </List>
            </DragContainer>
            <Button
                className={classes.button}
                startIcon={<AddIcon />}
                color="neutral"
                variant="contained"
                onClick={() => onAddIngredientRef()}
            >
                Add Ingredient
            </Button>
            <Box my={MARGIN}>
                <TextField
                    name="directions"
                    label="Directions"
                    multiline
                    minRows={6}
                    maxRows={
                        (windowSize.height - 75) /
                        2 /
                        18 /* aiming for something around 50vh */
                    }
                    value={draft.directions || ""}
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
                            name="recipeYield"
                            label="Yield"
                            fullWidth
                            placeholder="Yield (in servings)"
                            value={draft.recipeYield || ""}
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
                            value={draft.totalTime || ""}
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
                            value={draft.calories || ""}
                            onChange={handleNumericUpdate}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box my={MARGIN}>
                <LabelAutoComplete
                    labelList={labelList || []}
                    recipeLabels={draft.labels}
                    onLabelChange={handleLabelChange}
                />
            </Box>
            <Grid container justifyContent={"space-between"}>
                <Grid item>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        onClick={() => onSave(draft)}
                        startIcon={<SaveIcon />}
                    >
                        Save
                    </Button>
                    {onSaveCopy && (
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="neutral"
                            startIcon={<CopyIcon />}
                            onClick={() => onSaveCopy(draft)}
                        >
                            Save as Copy
                        </Button>
                    )}
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="neutral"
                        onClick={() => onCancel(draft)}
                        startIcon={<CancelIcon />}
                    >
                        Cancel
                    </Button>
                </Grid>
                {extraButtons && <Grid item>{extraButtons}</Grid>}
            </Grid>
        </>
    );
};

export default RecipeForm;
