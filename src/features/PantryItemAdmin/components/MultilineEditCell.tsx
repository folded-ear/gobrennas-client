import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import { Result } from "../../../data/hooks/usePantryItemSearch";
import * as React from "react";
import { ChangeEvent, useCallback, useLayoutEffect, useState } from "react";
import { Paper } from "@mui/material";
import Popper from "@mui/material/Popper";
import Input from "@mui/material/Input";

export default function MultilineEditCell(
    props: GridRenderEditCellParams<Result, string[]>,
) {
    const { id, field, value, colDef, hasFocus } = props;
    const [valueState, setValueState] = React.useState(
        value ? value.join(", ") : "",
    );
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
    const apiRef = useGridApiContext();

    useLayoutEffect(() => {
        if (hasFocus && inputRef) {
            inputRef.focus();
        }
    }, [hasFocus, inputRef]);

    const handleRef = useCallback((el: HTMLElement | null) => {
        setAnchorEl(el);
    }, []);

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
        <div style={{ position: "relative", alignSelf: "flex-start" }}>
            <div
                ref={handleRef}
                style={{
                    height: 1,
                    width: colDef.computedWidth,
                    display: "block",
                    position: "absolute",
                    top: 0,
                }}
            />
            {anchorEl && (
                <Popper open anchorEl={anchorEl} placement="bottom-start">
                    <Paper
                        elevation={1}
                        sx={{
                            p: 1,
                            minWidth: colDef.computedWidth,
                            maxWidth: colDef.computedWidth * 2,
                        }}
                    >
                        <Input
                            multiline
                            value={valueState}
                            placeholder={"Comma-delimited " + colDef.headerName}
                            onChange={handleChange}
                            inputRef={(ref) => setInputRef(ref)}
                        />
                    </Paper>
                </Popper>
            )}
        </div>
    );
}
