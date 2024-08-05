import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import { Result } from "@/data/hooks/usePantryItemSearch";
import { useGetAllLabels } from "@/data/hooks/useGetAllLabels";
import { ChipPicker } from "@/global/components/ChipPicker";
import * as React from "react";
import { useCallback } from "react";
import PopperEditCell from "./PopperEditCell";

export default function LabelsEditCell(
    props: GridRenderEditCellParams<Result, string[]>,
) {
    const { id, field, value } = props;
    const { data: labelList } = useGetAllLabels();
    const apiRef = useGridApiContext();

    const handleChange = useCallback(
        (e, labels: string[]) => {
            const val = labels.map((label) => label.replace(/\/+/g, "-"));
            apiRef.current.setEditCellValue({ id, field, value: val }, e);
        },
        [apiRef, id, field],
    );

    return (
        <PopperEditCell
            {...props}
            renderControl={(inputRef) => (
                <ChipPicker
                    value={value || []}
                    options={labelList}
                    size={"small"}
                    fieldPlaceholder={"Add"}
                    onChange={handleChange}
                    inputRef={inputRef}
                />
            )}
        />
    );
}
