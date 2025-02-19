import { IconButtonProps } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Blank } from "./icons";

const PlaceholderIconButton = ({ ...props }: IconButtonProps) => {
    return (
        <IconButton
            disabled
            size="small"
            {...props}
            sx={{ visibility: "hidden" }}
        >
            <Blank />
        </IconButton>
    );
};

export default PlaceholderIconButton;
