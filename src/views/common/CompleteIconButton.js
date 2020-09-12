import { Check } from "@material-ui/icons";
import React from "react";
import {
    coloredIconButton,
    completeColor,
} from "./colors";

const ColoredButton = coloredIconButton(completeColor);

const CompleteIconButton = props =>
    <ColoredButton
        aria-label="complete"
        {...props}
    >
        <Check />
    </ColoredButton>;

export default CompleteIconButton;
