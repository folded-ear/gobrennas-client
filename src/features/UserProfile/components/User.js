import makeStyles from "@material-ui/core/styles/makeStyles";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import React from "@types/react";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "inline-flex",
        alignItems: "center",
    },
    inline: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        margin: 0,
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
                  inline = false,
              }) => {
    const classes = useStyles();
    const avatar = <Avatar
        src={imageUrl}
        className={classes[classes.hasOwnProperty(size) ? size : inline ? "inline" : "small"]}
    >
        {(name || email || "U").charAt(0).toUpperCase()}
    </Avatar>;
    if (inline) return avatar;
    return <Box
        title={iconOnly ? name ? `${name} <${email}>` : email : email}
        className={classes.root}
    >
        {avatar}
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
    inline: PropTypes.bool,
};

export default User;