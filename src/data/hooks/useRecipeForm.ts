import { BfsId, Identified } from "@/global/types/identity";
import {
    DraftRecipe,
    IngredientRef,
    Recipe,
    Section,
} from "@/global/types/types";
import ClientId from "@/util/ClientId";
import dotProp from "dot-prop-immutable";
import * as React from "react";

export type UseRecipeFormReturn = {
    draft: DraftRecipe;
    onUpdate: (key: string, value: unknown) => void;
    onAddIngredientRef(key: string, idx?: number): void;
    onDeleteIngredientRef(key: string, idx: number): void;
    onMoveIngredientRef(
        key: string,
        activeId: BfsId,
        targetId: BfsId,
        above: boolean,
    ): void;
    onMultilinePasteIngredientRefs(
        key: string,
        idx: number,
        text: string,
    ): void;
    onAddSection(idx?: number): void;
    onDeleteSection(idx: number): void;
};

function setClientIds<T>(things: T[]): (T & { id: BfsId })[] {
    return things.map((t) => ({
        ...t,
        id: ClientId.next(),
    }));
}

const buildDraft = (recipe: Recipe): DraftRecipe => {
    return {
        ...recipe,
        ingredients: setClientIds(recipe.ingredients),
        sections: recipe.sections?.map((s) => ({
            ...s,
            ingredients: setClientIds(s.ingredients),
        })),
        photoUrl: recipe.photo,
        photoUpload: null,
        sourceId: null,
    };
};

export const buildNewIngredientRef = (
    raw?: string,
): IngredientRef & Identified => ({
    id: ClientId.next(),
    raw: raw || "",
    ingredient: null,
    preparation: null,
    quantity: null,
});

const buildNewSection = (sectionOf: BfsId): Section & Identified => ({
    id: ClientId.next(),
    sectionOf,
    name: "",
    directions: "",
    ingredients: [buildNewIngredientRef()],
    labels: [],
});

function getArrayToModify<T extends Identified>(
    draft: DraftRecipe,
    key: string,
): T[] {
    return (dotProp.get(draft, key) || []).slice(0);
}

export function useRecipeForm(recipe: Recipe): UseRecipeFormReturn {
    const [draft, setDraft] = React.useState(buildDraft(recipe));

    const onUpdate = (key: string, value: unknown) => {
        setDraft((draft) => dotProp.set(draft, key, value));
    };

    const onAdd = <T extends Identified>(
        key: string,
        creator: () => T,
        idx?: number,
    ) => {
        setDraft((draft) => {
            const items = getArrayToModify<T>(draft, key);
            const newIdx = idx ?? items.length;
            if (newIdx < -1 || newIdx >= items.length) {
                items.push(creator());
            } else {
                items.splice(newIdx + 1, 0, creator());
            }
            return dotProp.set(draft, key, items);
        });
    };

    const onDelete = (key: string, idx: number) => {
        setDraft((draft) => {
            const items = getArrayToModify(draft, key);
            if (items && idx >= 0 && idx < items.length) {
                items.splice(idx, 1);
                draft = dotProp.set(draft, key, items);
            }
            return draft;
        });
    };

    const onMoveWithin = (
        key: string,
        activeId: BfsId,
        targetId: BfsId,
        above: boolean,
    ) => {
        setDraft((draft) => {
            const items = getArrayToModify(draft, key);
            const idxActive = items.findIndex((it) => it.id === activeId);
            if (idxActive >= 0) {
                const removed = items.splice(idxActive, 1);
                let idxTarget = items.findIndex((it) => it.id === targetId);
                if (idxTarget < 0) idxTarget = items.length - 1;
                items.splice(above ? idxTarget : idxTarget + 1, 0, ...removed);
            }
            return dotProp.set(draft, key, items);
        });
    };

    const onMultilinePasteIngredientRefs = (
        key: string,
        idx: number,
        text: string,
    ) => {
        setDraft((draft) => {
            const ings = getArrayToModify<IngredientRef & Identified>(
                draft,
                key,
            );
            const newIndx =
                idx < 0 ? 0 : idx < ings.length ? idx : ings.length - 1;
            if (ings[newIndx].raw?.length === 0) {
                // if pasting into an empty one, delete it
                ings.splice(idx--, 1);
            }
            ings.splice(
                ++idx,
                0,
                ...text
                    .split("\n")
                    .map((it) => it.trim())
                    .filter((it) => it.length > 0)
                    .map(buildNewIngredientRef),
            );
            return dotProp.set(draft, key, ings);
        });
    };

    return {
        draft,
        onUpdate,
        onAddIngredientRef: (key, idx) =>
            onAdd(key, buildNewIngredientRef, idx),
        onDeleteIngredientRef: onDelete,
        onMoveIngredientRef: onMoveWithin,
        onMultilinePasteIngredientRefs,
        // a draft's id will never change, so this is safe
        onAddSection: () => onAdd("sections", () => buildNewSection(draft.id)),
        onDeleteSection: (idx: number) => onDelete("sections", idx),
    };
}
