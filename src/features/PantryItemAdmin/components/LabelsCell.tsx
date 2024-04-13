import LabelItem from "../../../global/components/LabelItem";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { Result } from "../../../data/hooks/usePantryItemSearch";

export default function LabelsCell(
    props: GridRenderCellParams<Result, string[]>,
) {
    const { value } = props;
    return (
        <>
            {(value || []).map((l, i) => (
                <LabelItem key={i} label={l} />
            ))}
        </>
    );
}
