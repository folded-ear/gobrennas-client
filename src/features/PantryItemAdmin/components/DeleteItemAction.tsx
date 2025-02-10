import { Result } from "@/data/hooks/usePantryItemSearch";
import { DeleteIcon } from "@/views/common/icons";
import { GridActionsCellItem } from "@mui/x-data-grid";

interface Props {
    row: Result;
    onDelete: () => void;
}

export default function DeleteItemAction({ row, onDelete }: Props) {
    const title = `Delete '${row.name}'`;
    return (
        <GridActionsCellItem
            label={title}
            title={title}
            color={"primary"}
            icon={<DeleteIcon />}
            disabled={row.useCount > 0}
            onClick={() => onDelete()}
        />
    );
}
