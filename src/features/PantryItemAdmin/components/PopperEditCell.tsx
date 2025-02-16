import { Paper } from "@mui/material";
import Popper from "@mui/material/Popper";
import { GridRenderEditCellParams } from "@mui/x-data-grid";
import * as React from "react";
import { useCallback, useLayoutEffect, useState } from "react";

export default function PopperEditCell(
    props: GridRenderEditCellParams<never, string[]> & {
        renderControl: (
            inputRef: React.Ref<HTMLInputElement>,
        ) => React.ReactNode;
    },
) {
    const { renderControl, colDef, hasFocus } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

    useLayoutEffect(() => {
        if (hasFocus && inputRef) {
            inputRef.focus();
        }
    }, [hasFocus, inputRef]);

    const handleRef = useCallback((el: HTMLElement | null) => {
        setAnchorEl(el);
    }, []);

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
            <Popper
                open={!!anchorEl}
                anchorEl={anchorEl}
                placement="bottom-start"
            >
                <Paper
                    elevation={1}
                    sx={{
                        p: 1,
                        minWidth: colDef.computedWidth,
                        maxWidth: colDef.computedWidth * 2,
                    }}
                >
                    {renderControl(setInputRef)}
                </Paper>
            </Popper>
        </div>
    );
}
