import { DeleteForeverOutlined } from "@material-ui/icons";
import React from "react";
import {
    coloredIconButton,
    deleteColor,
} from "./colors";

const ColoredButton = coloredIconButton(deleteColor);

const DeleteIconButton = props =>
    <ColoredButton
        aria-label="delete"
        {...props}
    >
        <DeleteForeverOutlined />
    </ColoredButton>;

export default DeleteIconButton;
