import { BfsId } from "@/global/types/identity";
import { DraftRecipe, Recipe } from "@/global/types/types";
import ClientId from "@/util/ClientId";
import dotProp from "dot-prop-immutable";
import * as React from "react";

type UseRecipeFormReturn = {
    draft: DraftRecipe;
    onUpdate: (key: string, value: unknown) => void;
    onAddIngredientRef: (idx?: number, text?: string) => void;
    onDeleteIngredientRef: (idx: number) => void;
    onMoveIngredientRef: (
        activeId: BfsId,
        targetId: BfsId,
        above: boolean,
    ) => void;
    onMultilinePasteIngredientRefs: (idx: number, text: string) => void;
};

const buildDraft = (recipe: Recipe<unknown>): DraftRecipe => {
    return {
        ...recipe,
        ingredients: recipe.ingredients.map((ing) => ({
            ...ing,
            id: ClientId.next(),
        })),
        photoUrl: recipe.photo,
        photoUpload: null,
        sourceId: null,
    };
};

const buildNewIngredient = (raw?: string) => ({
    id: ClientId.next(),
    raw: raw || "",
    ingredient: null,
    preparation: null,
    quantity: null,
});

export function useRecipeForm(recipe: Recipe<unknown>): UseRecipeFormReturn {
    const [draft, setDraft] = React.useState(buildDraft(recipe));

    const onUpdate = (key: string, value: unknown) => {
        setDraft((draft) => dotProp.set(draft, key, value));
    };

    const onAddIngredientRef = (idx?: number) => {
        const ing = buildNewIngredient();
        const ings =
            draft.ingredients == null ? [] : draft.ingredients.slice(0);
        const newIdx = idx ?? ings.length;
        if (newIdx < 0 || newIdx >= ings.length) {
            ings.push(ing);
        } else {
            ings.splice(newIdx + 1, 0, ing);
        }
        setDraft(dotProp.set(draft, "ingredients", ings));
    };

    const onDeleteIngredientRef = (idx: number) => {
        if (draft.ingredients && idx <= draft.ingredients.length) {
            const ings = draft.ingredients.slice(0);
            ings.splice(idx, 1);
            setDraft(dotProp.set(draft, "ingredients", ings));
        }
    };

    const onMoveIngredientRef = (
        activeId: BfsId,
        targetId: BfsId,
        above: boolean,
    ) => {
        const ings =
            draft.ingredients == null ? [] : draft.ingredients.slice(0);
        const idxActive = ings.findIndex((it) => it.id === activeId);
        if (idxActive > 0) {
            const removed = ings.splice(idxActive, 1);
            const idxTarget = ings.findIndex((it) => it.id === targetId);
            if (idxTarget > 0) {
                ings.splice(above ? idxTarget : idxTarget + 1, 0, ...removed);
            }
        }
        setDraft(dotProp.set(draft, "ingredients", ings));
    };

    const onMultilinePasteIngredientRefs = (idx: number, text: string) => {
        const ings =
            draft.ingredients == null ? [] : draft.ingredients.slice(0);
        const newIndx = idx < 0 ? 0 : idx < ings.length ? idx : ings.length - 1;
        if (ings[newIndx].raw?.length === 0) {
            // if pasting into an empty on, delete it
            ings.splice(idx--, 1);
        }
        ings.splice(
            ++idx,
            0,
            ...text
                .split("\n")
                .map((it) => it.trim())
                .filter((it) => it.length > 0)
                .map(buildNewIngredient),
        );
        setDraft(dotProp.set(draft, "ingredients", ings));
    };

    return {
        draft,
        onUpdate,
        onAddIngredientRef,
        onDeleteIngredientRef,
        onMoveIngredientRef,
        onMultilinePasteIngredientRefs,
    };
}
