import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import withStyles from "@mui/styles/withStyles";
import PropTypes from "prop-types";
import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import DragHandle from "./DragHandle";
import classnames from "classnames";
import { darken } from "@mui/material";

const Item = ({
    depth = 0,
    prefix,
    suffix,
    children,
    classes,
    className,
    hideDivider,
    dragId,
    ...props
}) => {
    const draggable = dragId != null;
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
        disabled: !draggable,
    });
    const setNodeRef = (...args) => {
        setDraggableRef(...args);
        setDroppableRef(...args);
    };
    return (
        <ListItem
            ref={setNodeRef}
            disableGutters
            disablePadding
            className={classnames(className, {
                [classes.root]: !hideDivider,
                [classes.dragging]: draggable && isDragging,
                [classes.over]: draggable && isOver && !isDragging,
            })}
            {...props}
        >
            {(draggable || prefix || depth) && (
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

Item.propTypes = {
    depth: PropTypes.number,
    prefix: PropTypes.node,
    children: PropTypes.node.isRequired,
    suffix: PropTypes.node,
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    hideDivider: PropTypes.bool,
    dragId: PropTypes.any,
};

export default withStyles((theme) => ({
    root: {
        borderBottom: "1px solid #eee",
    },
    over: {
        backgroundColor:
            darken(theme.palette.secondary.main, 0.2) + " !important",
    },
    dragging: {
        opacity: 0.3,
    },
}))(Item);
