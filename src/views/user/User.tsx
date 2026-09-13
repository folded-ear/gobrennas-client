import { MakeOptional } from "@/__generated__/graphql";
import type { UserType } from "@/global/types/identity";
import SizedAvatar, { SizedAvatarProps } from "@/views/SizedAvatar";
import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";

const useStyles = makeStyles({
    root: {
        display: "inline-flex",
        alignItems: "center",
    },
    stacked: {
        display: "inline-flex",
        flexDirection: "column",
        lineHeight: 1.25,
    },
    email: {
        fontSize: "0.75em",
        opacity: 0.7,
    },
});

export interface UserProps
    extends Pick<SizedAvatarProps, "inline" | "size">,
        MakeOptional<
            Pick<UserType, "imageUrl" | "name" | "email">,
            "imageUrl" | "name"
        > {
    iconOnly?: boolean;
    showEmail?: boolean;
}

const User: React.FC<UserProps> = ({
    name,
    email,
    imageUrl,
    size,
    iconOnly = false,
    inline = false,
    showEmail = false,
}) => {
    const classes = useStyles();
    const avatar = (
        <SizedAvatar
            src={imageUrl || undefined}
            title={name || email || undefined}
            size={size}
            inline={inline}
        >
            {(name || email || "U").charAt(0).toUpperCase()}
        </SizedAvatar>
    );
    if (inline) return avatar;
    if (showEmail && !iconOnly) {
        return (
            <Box className={classes.root}>
                {avatar}
                <span className={classes.stacked}>
                    <span>{name || email}</span>
                    {name && <span className={classes.email}>{email}</span>}
                </span>
            </Box>
        );
    }
    return (
        <Box
            title={
                (iconOnly ? (name ? `${name} <${email}>` : email) : email) ||
                undefined
            }
            className={classes.root}
        >
            {avatar}
            {!iconOnly && <React.Fragment> {name || email}</React.Fragment>}
        </Box>
    );
};

export default User;
