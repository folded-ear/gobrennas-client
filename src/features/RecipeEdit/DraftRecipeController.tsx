import PageBody from "views/common/PageBody";
import RecipeForm from "features/RecipeEdit/components/RecipeForm";
import { DraftRecipe, Recipe } from "global/types/types";
import { useRecipeForm } from "features/RecipeEdit/hooks/useRecipeForm";
import React from "react";
import { AutocompleteChangeReason } from "@mui/material";
import { TextractForm } from "features/RecipeEdit/components/TextractForm";
import { useGetAllLabels } from "data/hooks/useGetAllLabels";
import DeleteButton from "views/common/DeleteButton";
import { BfsId } from "global/types/identity";
import RecipeApi from "data/RecipeApi";

type DraftRecipeControllerProps = {
    recipe: Recipe;
    title: string;
    onSave: (r: DraftRecipe) => void;
    onCancel: (r?: DraftRecipe) => void;
};

export const DraftRecipeController: React.FC<DraftRecipeControllerProps> = ({
    recipe,
    title,
    onSave,
    onCancel,
}) => {
    const {
        draft,
        onUpdate,
        onMoveIngredientRef,
        onAddIngredientRef,
        onEditIngredientRef,
        onDeleteIngredientRef,
        onMultilinePasteIngredientRefs,
    } = useRecipeForm(recipe);
    const { data: labelList } = useGetAllLabels();

    const isNumeric = React.useCallback(
        (str: string): boolean => !isNaN(parseFloat(str)),
        [],
    );

    const handleUpdate = React.useCallback(
        (e) => {
            const { name: key, value } = e.target;
            isNumeric(value)
                ? onUpdate(key, parseFloat(value))
                : onUpdate(key, value ? value : "");
        },
        [onUpdate, isNumeric],
    );

    const handleLabelChange = (
        e,
        labels: string[],
        reason: AutocompleteChangeReason,
    ) => {
        // One of "createOption", "selectOption", "removeOption", "blur" or "clear".
        if (reason === "selectOption" || "createOption" || "removeOption") {
            const val = labels.map((label) => label.replace(/\/+/g, "-"));
            onUpdate("labels", val);
        }
    };

    const updateTextract = (key, value) => {
        onUpdate(key, value);
    };

    const handleDelete = (id: BfsId) => {
        RecipeApi.deleteRecipe(id);
    };

    return (
        <PageBody>
            <TextractForm
                updateDraft={updateTextract}
                draft={draft}
                onMultilinePaste={onMultilinePasteIngredientRefs}
            />
            <RecipeForm
                draft={draft}
                title={title}
                onAddIngredientRef={onAddIngredientRef}
                onEditIngredientRef={onEditIngredientRef}
                onDeleteIngredientRef={onDeleteIngredientRef}
                onMoveIngredientRef={onMoveIngredientRef}
                onMultilinePasteIngredientRefs={onMultilinePasteIngredientRefs}
                onSave={onSave}
                onUpdate={handleUpdate}
                onUpdateLabels={handleLabelChange}
                onCancel={onCancel}
                labelList={labelList}
                extraButtons={
                    <DeleteButton
                        type="recipe"
                        label="Delete Recipe"
                        onConfirm={() => handleDelete(recipe.id)}
                    />
                }
            />
        </PageBody>
    );
};
