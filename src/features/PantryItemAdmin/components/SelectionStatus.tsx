import { Button, Grid } from "@mui/material";
import { MergeType as CombineIcon } from "@mui/icons-material";
import React from "react";

export interface SelectionStatusProps {
    selectedCount: number;
    onCombine: () => void;
}

export default function SelectionStatus({
    selectedCount: count,
    onCombine,
}: SelectionStatusProps) {
    return (
        <Grid container gap={1} alignItems={"center"}>
            {count > 0 && (
                <>
                    {count} {count === 1 ? "row" : "rows"} selected
                </>
            )}
            {onCombine && count > 0 && (
                <Button
                    disabled={count < 2}
                    onClick={onCombine}
                    variant={"text"}
                    size={"small"}
                    startIcon={<CombineIcon />}
                    title={`Combine these ${count} items, and update references`}
                >
                    Combine
                </Button>
            )}
        </Grid>
    );
}
