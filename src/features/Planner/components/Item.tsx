import ClientId from "@/util/ClientId";
import { UniqueIdentifier, useDraggable, useDroppable } from "@dnd-kit/core";
import { darken, lighten } from "@mui/material";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import withStyles from "@mui/styles/withStyles";
import classnames from "classnames";
import { ReactNode } from "react";
import DragHandle from "./DragHandle";

type Props = {
    depth?: number;
    prefix?: ReactNode;
    suffix?: ReactNode;
    className?: string;
    hideDivider?: boolean;
    dragId?: UniqueIdentifier;
    noDrag?: boolean;
} & Omit<ListItemProps, "prefix">;

const Item = ({
    depth = 0,
    prefix,
    suffix,
    children,
    classes,
    className,
    hideDivider,
    dragId: explicitDragId,
    noDrag = false,
    ...props
}: Props & { classes: any }) => {
    const droppable = explicitDragId != null;
    const dragId = droppable ? explicitDragId : ClientId.next();
    const draggable = droppable && !noDrag;
    const {
        attributes,
        listeners,
        setNodeRef: setDraggableRef,
        setActivatorNodeRef,
        isDragging,
    } = useDraggable({
        id: dragId,
        disabled: !draggable,
    });
    const { isOver, setNodeRef: setDroppableRef } = useDroppable({
        id: dragId,
        disabled: !droppable,
    });
    const setNodeRef = (el: HTMLElement | null) => {
        setDraggableRef(el);
        setDroppableRef(el);
    };
    return (
        <ListItem
            ref={setNodeRef}
            disableGutters
            disablePadding
            className={classnames(className, {
                [classes.root]: !hideDivider,
                [classes.dragging]: draggable && isDragging,
                [classes.over]: droppable && isOver && !isDragging,
            })}
            {...props}
        >
            {(draggable || prefix || depth > 0) && (
                <ListItemIcon>
                    {draggable && (
                        <DragHandle
                            ref={setActivatorNodeRef}
                            {...listeners}
                            {...attributes}
                            tabIndex={-1}
                        />
                    )}
                    {depth !== 0 && (
                        <span
                            style={{
                                display: "inline-block",
                                width: depth * 2 + "em",
                            }}
                        />
                    )}
                    {prefix}
                </ListItemIcon>
            )}
            {children}
            {suffix && (
                <ListItemSecondaryAction>{suffix}</ListItemSecondaryAction>
            )}
        </ListItem>
    );
};

export default withStyles((theme) => ({
    root: {
        borderBottom:
            "1px solid " +
            (theme.palette.mode === "dark"
                ? theme.palette.neutral.light
                : theme.palette.neutral.main),
    },
    over: {
        backgroundColor:
            theme.palette.mode === "dark"
                ? lighten(theme.palette.neutral.main, 0.2) + " !important"
                : darken(theme.palette.neutral.main, 0.2) + " !important",
    },
    dragging: {
        opacity: 0.3,
    },
}))(Item);
