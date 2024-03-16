import React from "react";
import {
    Button,
    DialogContent,
    IconButton,
    IconButtonProps,
    Tooltip,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";

interface Props {
    size?: IconButtonProps["size"];
    buttonTitle: string;
    modalTitle?: string;
    icon: React.ReactNode;
    render: () => React.ReactNode;
}

const ModalButton: React.FC<Props> = ({
    size = "large",
    buttonTitle,
    icon,
    modalTitle = buttonTitle,
    render,
}) => {
    const [open, setOpen] = React.useState(false);
    const button = (
        <Tooltip title={buttonTitle} placement="bottom">
            <IconButton onClick={() => setOpen(true)} size={size}>
                {icon}
            </IconButton>
        </Tooltip>
    );

    const handleClose = () => setOpen(false);
    return (
        <>
            {button}
            <Dialog open={open} onClose={handleClose} maxWidth={"sm"} fullWidth>
                <DialogTitle>{modalTitle}</DialogTitle>
                <DialogContent>{render()}</DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ModalButton;
