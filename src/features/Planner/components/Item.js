import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import withStyles from "@mui/styles/withStyles";
import PropTypes from "prop-types";
import React from "react";
import {
    useDraggable,
    useDroppable
} from "@dnd-kit/core";
import DragHandle from "./DragHandle";
import classnames from "classnames";

const Item = ({
                  depth = 0,
                  prefix,
                  suffix,
                  children,
                  classes,
                  className,
                  dragId,
                  ...props
              }) => {
    const draggable = !!dragId;
    const {
        attributes,
        listeners,
        setNodeRef: setDraggableRef,
        setActivatorNodeRef,
        isDragging,
    } = useDraggable({
        id: dragId,
        disabled: !draggable
    });
    const {
        setNodeRef: setDroppableRef,
    } = useDroppable({
        id: dragId,
        disabled: !draggable
    });
    const setNodeRef = (...args) => {
        setDraggableRef(...args);
        setDroppableRef(...args);
    };
    return <ListItem
        ref={setNodeRef}
        disableGutters
        style={{
            paddingLeft: depth * 2 + "em",
            // These should be unneeded, because of <List disablePadding /> but
            // that attribute doesn't actually _do_ anything. The "dense"
            // attribute does do something, so it's probably my misunderstanding
            // of what/how it's supposed to work?
            paddingTop: 0,
            paddingBottom: 0,
        }}
        className={classnames(classes.root, className, {
            [classes.dragging]: draggable && isDragging
        })}
        {...props}
    >
        {(draggable || prefix) && <ListItemIcon>
            {draggable && <DragHandle
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
            />}
            {prefix}
        </ListItemIcon>}
        {children}
        {suffix && <ListItemSecondaryAction>
            {suffix}
        </ListItemSecondaryAction>}
    </ListItem>;
};

Item.propTypes = {
    depth: PropTypes.number,
    prefix: PropTypes.node,
    children: PropTypes.node.isRequired,
    suffix: PropTypes.node,
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    dragId: PropTypes.any,
};

export default withStyles({
    root: {
        borderBottom: "1px solid #eee",
    },
    dragging: {
        opacity: 0.3,
    },
})(Item);
