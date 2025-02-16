import type { UserType } from "@/global/types/identity";
import SizedAvatar, { SizedAvatarProps } from "@/views/SizedAvatar";
import { MakeOptional } from "@/__generated__/graphql";
import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";

const useStyles = makeStyles({
    root: {
        display: "inline-flex",
        alignItems: "center",
    },
});

export interface UserProps
    extends Pick<SizedAvatarProps, "inline" | "size">,
        MakeOptional<
            Pick<UserType, "imageUrl" | "name" | "email">,
            "imageUrl" | "name"
        > {
    iconOnly?: boolean;
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
