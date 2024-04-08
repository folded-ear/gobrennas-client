import { Visibility as ViewUsesIcon } from "@mui/icons-material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import React from "react";
import { Result } from "../../../data/hooks/usePantryItemSearch";

interface Props {
    row: Result;
    onViewUses: () => void;
}
export default function ViewUsesAction({ row, onViewUses }: Props) {
    const title = `View uses of '${row.name}'`;
    return (
        <GridActionsCellItem
            label={title}
            title={title}
            icon={<ViewUsesIcon />}
            disabled={row.useCount === 0}
            onClick={() => onViewUses()}
        />
    );
}
