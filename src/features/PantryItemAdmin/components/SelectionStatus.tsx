import { CombineIcon } from "@/views/common/icons";
import { Button, Grid } from "@mui/material";

export interface SelectionStatusProps {
    selectedCount: number;
    onCombine: () => void;
}

export default function SelectionStatus({
    selectedCount: count,
    onCombine,
}: SelectionStatusProps) {
    if (count === 0) return null;
    return (
        <Grid container gap={1} alignItems={"center"}>
            {count} {count === 1 ? "row" : "rows"} selected
            {onCombine && (
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
