import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import PropTypes from "prop-types";
import React from "react";

const Item = ({
    depth,
    prefix,
    suffix,
    children,
    ...props
}) =>
    <ListItem
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

Item.propTypes = {
    depth: PropTypes.number.isRequired,
    prefix: PropTypes.node,
    children: PropTypes.node.isRequired,
    suffix: PropTypes.node,
};

export default Item;
