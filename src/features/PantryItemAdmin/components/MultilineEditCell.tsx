import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import { Result } from "@/data/hooks/usePantryItemSearch";
import * as React from "react";
import { ChangeEvent, useCallback } from "react";
import Input from "@mui/material/Input";
import PopperEditCell from "./PopperEditCell";

export default function MultilineEditCell(
    props: GridRenderEditCellParams<Result, string[]>,
) {
    const { id, field, value, colDef } = props;
    const [valueState, setValueState] = React.useState(
        value ? value.join(", ") : "",
    );
    const apiRef = useGridApiContext();

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setValueState(value);
            apiRef.current.setEditCellValue(
                {
                    id,
                    field,
                    value: value
                        .replace(/\s+/, " ")
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    debounceMs: 200,
                },
                e,
            );
        },
        [apiRef, id, field],
    );

    return (
        <PopperEditCell
            {...props}
            renderControl={(inputRef) => (
                <Input
                    multiline
                    fullWidth
                    value={valueState}
                    placeholder={"Comma-delimited " + colDef.headerName}
                    onChange={handleChange}
                    inputRef={inputRef}
                />
            )}
        />
    );
}
