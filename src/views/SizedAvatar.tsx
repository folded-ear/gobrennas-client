import { AvatarProps } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
    inline: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        margin: 0,
    },
    small: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        margin: "0 " + theme.spacing(1),
    },
    large: {
        width: theme.spacing(6),
        height: theme.spacing(6),
        margin: theme.spacing(1),
    },
}));

export interface SizedAvatarProps extends AvatarProps {
    size?: "small" | "large";
    inline?: boolean;
}

export default function SizedAvatar({
    size,
    inline = false,
    ...passthrough
}: SizedAvatarProps) {
    const classes = useStyles();
    return (
        <Avatar
            className={
                classes[
                    size && classes.hasOwnProperty(size)
                        ? size
                        : inline
                        ? "inline"
                        : "small"
                ]
            }
            {...passthrough}
        />
    );
}
