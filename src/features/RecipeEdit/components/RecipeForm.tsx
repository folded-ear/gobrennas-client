import { useRecipeForm, UseRecipeFormReturn } from "@/data/hooks/useRecipeForm";
import useWindowSize from "@/data/useWindowSize";
import DragContainer, {
    Vert,
} from "@/features/Planner/components/DragContainer";
import DragHandle from "@/features/Planner/components/DragHandle";
import Item from "@/features/Planner/components/Item";
import IngredientDirectionsRow from "@/features/RecipeDisplay/components/IngredientDirectionsRow";
import PositionPicker from "@/features/RecipeEdit/components/PositionPicker";
import { TextractForm } from "@/features/RecipeEdit/components/TextractForm";
import { BfsId } from "@/global/types/identity";
import { DraftRecipe, IngredientRef, Recipe } from "@/global/types/types";
import { useIsMobile } from "@/providers/IsMobile";
import ImageDropZone from "@/util/ImageDropZone";
import useWhileOver from "@/util/useWhileOver";
import DeleteButton from "@/views/common/DeleteButton";
import {
    AddIcon,
    CancelIcon,
    CopyIcon,
    DeleteIcon,
    SaveIcon,
} from "@/views/common/icons";
import ElEdit, { WithTarget } from "@/views/ElEdit";
import {
    AutocompleteChangeReason,
    Box,
    Button,
    ButtonProps,
    Grid,
    IconButton,
    List,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";
import { ReactNode } from "react";
import { LabelAutoComplete } from "./LabelAutoComplete";

const MARGIN = 2;
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
    const classes = useStyles();

    const {
        draft,
        onUpdate,
        onAddIngredientRef,
        onDeleteIngredientRef,
        onMoveIngredientRef,
        onMultilinePasteIngredientRefs,
        onAddSection,
        onDeleteSection,
    } = useRecipeForm(recipe);

    const handleUpdate = React.useCallback(
        (e: WithTarget<string | IngredientRef<unknown>>) => {
            const { name: key, value } = e.target;
            onUpdate(key, value ? value : "");
        },
        [onUpdate],
    );

    const handleNumericUpdate = React.useCallback(
        (e: WithTarget<string>) => {
            const { name: key, value } = e.target;
            const v = parseFloat(value);
            onUpdate(key, isNaN(v) ? null : v);
        },
        [onUpdate],
    );

    const handleLabelChange = (
        key: string,
        labels: string[],
        reason: AutocompleteChangeReason,
    ) => {
        if (
            reason === "selectOption" ||
            reason === "createOption" ||
            reason === "removeOption"
        ) {
            const val = labels.map((label) => label.replace(/\/+/g, "-"));
            onUpdate(key, val);
        }
    };

    const hasPhoto: boolean =
        draft.photoUpload !== null || draft.photoUrl !== null;

    const hasSections = draft.sections && draft.sections.length > 0;
    return (
        <>
            <Typography variant="h2">{title}</Typography>
            <TextractForm
                updateDraft={onUpdate}
                draft={draft}
                onMultilinePaste={(idx, text) =>
                    onMultilinePasteIngredientRefs("ingredients", idx, text)
                }
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
            <HunkOfIngredients
                name={"ingredients"}
                container={draft}
                onUpdate={handleUpdate}
                onAddIngredientRef={onAddIngredientRef}
                onDeleteIngredientRef={onDeleteIngredientRef}
                onMoveIngredientRef={onMoveIngredientRef}
                onMultilinePasteIngredientRefs={onMultilinePasteIngredientRefs}
                onAddSection={hasSections ? undefined : onAddSection}
            />
            {draft.sections?.map((s, i) => {
                const owned = s.sectionOf === draft.id;
                const keyPrefix = `sections.${i}.`;
                return (
                    <SectionUi key={i}>
                        <Stack direction={"row"}>
                            <Typography variant={"h6"}>
                                {owned ? (
                                    <TextField
                                        name={keyPrefix + "name"}
                                        placeholder="Section Name"
                                        value={s.name || ""}
                                        size={"small"}
                                        onChange={handleUpdate}
                                        variant="outlined"
                                        inputProps={{
                                            sx: {
                                                minWidth: "10em",
                                                fontWeight: "bold",
                                            },
                                        }}
                                    />
                                ) : (
                                    s.name
                                )}
                            </Typography>
                            <DeleteButton
                                forType={"Section"}
                                onConfirm={() => onDeleteSection(i)}
                                tabIndex={-1}
                            />
                        </Stack>
                        {owned ? (
                            <>
                                <HunkOfIngredients
                                    name={keyPrefix + "ingredients"}
                                    container={s}
                                    onUpdate={handleUpdate}
                                    onAddIngredientRef={onAddIngredientRef}
                                    onDeleteIngredientRef={
                                        onDeleteIngredientRef
                                    }
                                    onMoveIngredientRef={onMoveIngredientRef}
                                    onMultilinePasteIngredientRefs={
                                        onMultilinePasteIngredientRefs
                                    }
                                    size={"small"}
                                />
                                <Box my={MARGIN}>
                                    <TextField
                                        name={keyPrefix + "directions"}
                                        label="Section Directions"
                                        size={"small"}
                                        multiline
                                        minRows={3}
                                        maxRows={
                                            (windowSize.height - 75) /
                                            2 /
                                            36 /* aiming for something around 25vh */
                                        }
                                        value={s.directions || ""}
                                        onChange={handleUpdate}
                                        placeholder="Section Directions"
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Box>
                                <Box my={MARGIN}>
                                    <LabelAutoComplete
                                        size={"small"}
                                        fieldLabel={"Section Labels"}
                                        labelList={labelList || []}
                                        recipeLabels={s.labels ?? undefined}
                                        onLabelChange={(_, labels, reason) =>
                                            handleLabelChange(
                                                keyPrefix + "labels",
                                                labels,
                                                reason,
                                            )
                                        }
                                    />
                                </Box>
                            </>
                        ) : (
                            <Grid container spacing={1}>
                                <IngredientDirectionsRow
                                    recipe={s}
                                    hideHeadings
                                />
                            </Grid>
                        )}
                    </SectionUi>
                );
            })}
            {hasSections && (
                <Button
                    className={classes.button}
                    startIcon={<AddIcon />}
                    color="neutral"
                    variant="contained"
                    onClick={() => onAddSection()}
                >
                    Section
                </Button>
            )}
            <Box my={MARGIN}>
                <TextField
                    name="directions"
                    label="Recipe Directions"
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
                    fieldLabel={"Recipe Labels"}
                    labelList={labelList || []}
                    recipeLabels={draft.labels ?? undefined}
                    onLabelChange={(_, labels, reason) =>
                        handleLabelChange("labels", labels, reason)
                    }
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

type HunkProps = Omit<
    UseRecipeFormReturn,
    "draft" | "onUpdate" | "onAddSection" | "onDeleteSection"
> & {
    name: string;
    container: Pick<DraftRecipe, "ingredients">;
    onUpdate: (e: WithTarget<string | IngredientRef<unknown>>) => void;
    size?: ButtonProps["size"];
    onAddSection?: UseRecipeFormReturn["onAddSection"];
};

function HunkOfIngredients({
    name,
    container,
    onUpdate,
    onAddIngredientRef,
    onDeleteIngredientRef,
    onMoveIngredientRef,
    onMultilinePasteIngredientRefs,
    onAddSection,
    size,
}: HunkProps) {
    const mobile = useIsMobile();
    const classes = useStyles();

    function handleIngredientDrop(
        activeId: BfsId,
        targetId: BfsId,
        vertical: Vert,
    ) {
        onMoveIngredientRef(name, activeId, targetId, vertical === "above");
    }

    return (
        <>
            <DragContainer
                onDrop={handleIngredientDrop}
                renderOverlay={(id) => (
                    <Box px={2} py={1}>
                        <DragHandle />
                        {container.ingredients.find((it) => it.id === id)
                            ?.raw || ""}
                    </Box>
                )}
            >
                <List>
                    {container.ingredients.map((it, i) => (
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
                                                onAddIngredientRef(name, i)
                                            }
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        size="small"
                                        tabIndex={-1}
                                        onClick={() =>
                                            onDeleteIngredientRef(name, i)
                                        }
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            }
                        >
                            <ElEdit
                                name={`${name}.${i}`}
                                value={it}
                                onChange={onUpdate}
                                onMultilinePaste={(text) =>
                                    onMultilinePasteIngredientRefs(
                                        name,
                                        i,
                                        text,
                                    )
                                }
                                onPressEnter={() => onAddIngredientRef(name, i)}
                                onDelete={() => onDeleteIngredientRef(name, i)}
                                placeholder={
                                    i === 0 ? "1 cup onion, diced fine" : ""
                                }
                            />
                        </Item>
                    ))}
                </List>
            </DragContainer>
            <Stack direction={"row"}>
                <Button
                    size={size}
                    className={classes.button}
                    startIcon={<AddIcon />}
                    color="neutral"
                    variant="contained"
                    onClick={() => onAddIngredientRef(name)}
                >
                    Ingredient
                </Button>
                {onAddSection && (
                    <Button
                        size={size}
                        className={classes.button}
                        startIcon={<AddIcon />}
                        color="neutral"
                        variant="contained"
                        onClick={() => onAddSection()}
                    >
                        Section
                    </Button>
                )}
            </Stack>
        </>
    );
}

function SectionUi({ children }: React.PropsWithChildren) {
    const { over, sensorProps } = useWhileOver();
    return (
        <Box my={MARGIN}>
            <Paper elevation={over ? 6 : 2} {...sensorProps}>
                <Box p={MARGIN}>{children}</Box>
            </Paper>
        </Box>
    );
}

export default RecipeForm;
