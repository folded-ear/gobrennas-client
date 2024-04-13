import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import { Result } from "../../../data/hooks/usePantryItemSearch";
import { useGetAllLabels } from "../../../data/hooks/useGetAllLabels";
import { ChipPicker } from "../../../global/components/ChipPicker";
import * as React from "react";
import { useCallback, useLayoutEffect, useState } from "react";
import { Paper } from "@mui/material";
import Popper from "@mui/material/Popper";

export default function LabelsEditCell(
    props: GridRenderEditCellParams<Result, string[]>,
) {
    const { id, field, value, colDef, hasFocus } = props;
    const { data: labelList } = useGetAllLabels();
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
        (e, labels: string[]) => {
            const val = labels.map((label) => label.replace(/\/+/g, "-"));
            apiRef.current.setEditCellValue({ id, field, value: val }, e);
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
                        <ChipPicker
                            value={value || []}
                            options={labelList}
                            size={"small"}
                            fieldPlaceholder={"Add"}
                            onChange={handleChange}
                            inputRef={(ref) => setInputRef(ref)}
                        />
                    </Paper>
                </Popper>
            )}
        </div>
    );
}
