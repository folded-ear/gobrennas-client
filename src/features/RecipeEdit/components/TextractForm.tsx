import TextractFormAugment from "@/features/RecipeEdit/components/TextractFormAugment";
import { DraftRecipe } from "@/global/types/types";
import { Button, ButtonGroup } from "@mui/material";
import React from "react";

type TextractFormProps = {
    updateDraft: (key: string, value: any) => void;
    onMultilinePaste: (idx: number, text: string) => void;
    draft: DraftRecipe;
};

export const TextractForm: React.FC<TextractFormProps> = ({
    updateDraft,
    draft,
    onMultilinePaste,
}) => {
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
                                onMultilinePaste(
                                    999999,
                                    lines
                                        .map((s) => s.trim())
                                        .filter((s) => s.length)
                                        .join("\n"),
                                )
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
