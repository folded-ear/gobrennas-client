import * as React from "react";
import { Button, ButtonGroup } from "@mui/material";
import Dispatcher from "data/dispatcher";
import RecipeActions from "data/RecipeActions";
import TextractFormAugment from "features/RecipeEdit/components/TextractFormAugment";

export const TextractForm = ({ updateDraft, draft }) => {
    return (
        <TextractFormAugment
            renderActions={(lines) => {
                const disabled = !(lines && lines.length);
                return (
                    <ButtonGroup>
                        <Button
                            onClick={() => updateDraft("name", lines[0])}
                            disabled={disabled || lines.length > 1}
                        >
                            Set Title
                        </Button>
                        <Button
                            onClick={() =>
                                Dispatcher.dispatch({
                                    type: RecipeActions.MULTI_LINE_DRAFT_INGREDIENT_PASTE_YO,
                                    index: 999999,
                                    text: lines
                                        .map((s) => s.trim())
                                        .filter((s) => s.length)
                                        .join("\n"),
                                })
                            }
                            disabled={disabled}
                        >
                            Add Ingredients
                        </Button>
                        <Button
                            onClick={() =>
                                updateDraft(
                                    "directions",
                                    (
                                        draft.directions +
                                        "\n\n" +
                                        lines.join("\n")
                                    ).trim(),
                                )
                            }
                            disabled={disabled}
                        >
                            Add Description
                        </Button>
                    </ButtonGroup>
                );
            }}
        />
    );
};
