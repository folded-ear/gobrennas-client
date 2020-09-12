import {
    coloredButton,
    deleteColor,
} from "./colors";
import waitNoBuilder from "./waitNoBuilder";

const DontDeleteButton = waitNoBuilder(coloredButton(deleteColor));

export default DontDeleteButton;
