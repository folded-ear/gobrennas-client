import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { UserType } from "../../global/types/types";

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

export interface UserProps extends Pick<UserType, "imageUrl" | "name" | "email"> {
    size?: "small" | "large",
    iconOnly?: boolean,
    inline?: boolean,
}

const User: React.FC<UserProps> = ({
                                   name,
                                   email,
                                   imageUrl,
                                   size,
                                   iconOnly = false,
                                   inline = false,
                               }) => {
    const classes = useStyles();
    const avatar = <Avatar
        src={imageUrl || undefined}
        className={classes[size && classes.hasOwnProperty(size) ? size : inline ? "inline" : "small"]}
    >
        {(name || email || "U").charAt(0).toUpperCase()}
    </Avatar>;
    if (inline) return avatar;
    return <Box
        title={(iconOnly
                ? name ? `${name} <${email}>` : email
                : email
        ) || undefined}
        className={classes.root}
    >
        {avatar}
        {!iconOnly && <React.Fragment>
            {" "}
            {name || email}
        </React.Fragment>}
    </Box>;
};

export default User;
