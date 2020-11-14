import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "inline-flex",
        alignItems: "center",
    },
    small: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        margin: theme.spacing(1),
    },
    large: {
        width: theme.spacing(6),
        height: theme.spacing(6),
        margin: theme.spacing(1),
    },
}));

const User = ({
    name,
    email,
    imageUrl,
    size,
    iconOnly = false,
}) => {
    const classes = useStyles();
    return <Box
        title={iconOnly ? name ? `${name} <${email}>` : email : email}
        className={classes.root}
    >
        <Avatar
            src={imageUrl}
            className={classes[classes.hasOwnProperty(size) ? size : "small"]}
        >
            {(name || email || "U").charAt(0).toUpperCase()}
        </Avatar>
        {!iconOnly && <React.Fragment>
            {" "}
            {name || email}
        </React.Fragment>}
    </Box>;
};

User.propTypes = {
    name: PropTypes.string,
    email: PropTypes.string,
    imageUrl: PropTypes.string,
    size: PropTypes.oneOf([
        "small",
        "large",
    ]),
    iconOnly: PropTypes.bool,
};

export default User;
