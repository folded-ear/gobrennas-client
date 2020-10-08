import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import withStyles from "@material-ui/core/styles/withStyles";
import PropTypes from "prop-types";
import React from "react";

const Item = ({
    depth = 0,
    prefix,
    suffix,
    children,
    classes,
    className,
    ...props
}) => {
    if (props.dragId && props.onDragDrop) {
        const itemId = props.dragId;
        const onDragDrop = props.onDragDrop;
        delete props.dragId;
        delete props.onDragDrop;
        props.onDragStart = e => {
            e.dataTransfer.setData("app/foodinger-data", itemId);
            e.dataTransfer.effectAllowed = "move";
        };
        props.onDragOver = e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        };
        props.onDrop = e => {
            e.preventDefault();
            let droppedId = e.dataTransfer.getData("app/foodinger-data");
            if (!isNaN(parseInt(droppedId, 10))) {
                droppedId = parseInt(droppedId, 10);
            }
            if (droppedId === itemId) return;
            const dropRect = e.currentTarget.getBoundingClientRect();
            const dropMidY = dropRect.y + (dropRect.height / 2);
            const dropMidX = dropRect.x + (dropRect.width / 2);
            onDragDrop(
                droppedId,
                itemId,
                e.clientY > dropMidY ? "below" : "above",
                e.clientX > dropMidX ? "right" : "left");
        };
        props.draggable = true;
    }
    return <ListItem
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
        className={classes.root + (className ? " " + className : "")}
        {...props}
    >
        {prefix && <ListItemIcon>
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
    onDragDrop: PropTypes.func,
};

export default withStyles({
    root: {
        borderBottom: "1px solid #eee",
    },
})(Item);
