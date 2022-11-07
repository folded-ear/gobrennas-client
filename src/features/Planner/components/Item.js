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
        // for drag sources
        props.draggable = true;
        props.onDragStart = e => {
            e.dataTransfer.setData("foodinger/data", itemId);
            const dragRect = e.currentTarget.getBoundingClientRect();
            e.dataTransfer.setData("foodinger/x-pos", (e.clientX - dragRect.x) / dragRect.width);
            e.dataTransfer.setData("foodinger/opacity", e.target.style.opacity);
            e.target.style.opacity = "0.3";
            e.dataTransfer.effectAllowed = "move";
        };
        props.onDragEnd = e => {
            e.target.style.opacity = e.dataTransfer.getData("foodinger/opacity");
        };
        // for drop targets
        props.onDragOver = e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        };
        props.onDrop = e => {
            e.preventDefault();
            let droppedId = e.dataTransfer.getData("foodinger/data");
            if (!isNaN(parseInt(droppedId, 10))) {
                droppedId = parseInt(droppedId, 10);
            }
            if (droppedId === itemId) return;
            const dropRect = e.currentTarget.getBoundingClientRect();
            const dragPos = parseFloat(e.dataTransfer.getData("foodinger/x-pos"));
            const dropPos = (e.clientX - dropRect.x) / dropRect.width;
            const dx = dropPos - dragPos;
            onDragDrop(
                droppedId,
                itemId,
                e.clientY > dropRect.y + (dropRect.height / 2) ? "below" : "above",
                // require 5% delta to count as a horizontal change
                dx > 0.05 ? "right" : dx < -0.05 ? "left" : null);
        };
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
