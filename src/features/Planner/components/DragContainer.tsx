import { BfsId, bfsIdEq } from "@/global/types/identity";
import {
    DndContext,
    DndContextProps,
    DragEndEvent,
    DragOverlay,
    rectIntersection,
} from "@dnd-kit/core";
import type { DragStartEvent } from "@dnd-kit/core/dist/types";
import { Box, darken, lighten, useTheme } from "@mui/material";
import * as React from "react";
import { useLayoutEffect, useState } from "react";

export type Vert = "above" | "below";
export type Horiz = "left" | "right" | "none";

interface Props extends DndContextProps {
    renderOverlay?(activeId: BfsId): React.ReactNode;

    /**
     * High-level event for when an item is dropped onto a different item, with
     * rudimentary "relative position" info. If you want more control, use the
     * raw DndKit events (e.g., onDragEnd).
     */
    onDrop?(
        activeId: BfsId,
        targetId: BfsId,
        vertical: Vert,
        horizontal: Horiz,
    ): void;
}

const DragContainer: React.FC<Props> = ({
    renderOverlay,
    onDrop,
    onDragStart,
    onDragEnd,
    children,
    ...passthrough
}) => {
    const theme = useTheme();
    const [activeId, setActiveId] = useState<BfsId | undefined>(undefined);
    const overlay =
        renderOverlay && activeId !== undefined && renderOverlay(activeId);
    const [overlayStyles, setOverlayStyles] = useState({});

    useLayoutEffect(() => {
        setOverlayStyles({
            backgroundColor:
                theme.palette.mode === "dark"
                    ? darken(theme.palette.primary.main, 0.4)
                    : lighten(theme.palette.primary.main, 0.4),
            opacity: 0.85,
            listStyle: "none",
        });
    }, [theme.palette.mode, theme.palette.primary.main]);

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id.toString());
        if (onDragStart) onDragStart(event);
    }

    function handleDragEnd(event: DragEndEvent) {
        if (onDragEnd) onDragEnd(event);
        if (!onDrop) return;
        setActiveId(undefined);
        if (!event.over) return;
        const id = event.active.id.toString();
        const targetId = event.over.id.toString();
        if (bfsIdEq(id, targetId)) return;
        const finalRect = event.active.rect.current.translated;
        const overRect = event.over.rect;
        let vertical: Vert = "below";
        let horizontal: Horiz = "none";
        if (finalRect) {
            vertical = finalRect.top < overRect.top ? "above" : "below";
            const dx = (overRect.left - finalRect.left) / overRect.width;
            horizontal = dx > 0.05 ? "left" : dx < -0.05 ? "right" : "none";
        }
        onDrop(id, targetId, vertical, horizontal);
    }

    return (
        <DndContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            collisionDetection={rectIntersection}
            {...passthrough}
        >
            {children}
            <DragOverlay>
                {overlay ? <Box style={overlayStyles}>{overlay}</Box> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default DragContainer;

export type { Props as DragContainerProps };
