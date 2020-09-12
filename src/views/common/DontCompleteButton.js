import {
    coloredButton,
    completeColor,
} from "./colors";
import waitNoBuilder from "./waitNoBuilder";

const DontCompleteButton = waitNoBuilder(coloredButton(completeColor));

export default DontCompleteButton;
