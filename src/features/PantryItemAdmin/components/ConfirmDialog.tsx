import { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, DialogContent, DialogContentText } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";

export interface DialogProps {
    open?: boolean;
    title?: string;
    content?: ReactNode;
    confirmLabel?: string;
    onClose?: (confirmed: boolean) => void;
}

export default function ConfirmDialog({
    open = false,
    title,
    content,
    confirmLabel,
    onClose,
}: DialogProps) {
    const handleCancel = () => onClose && onClose(false);
    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            scroll={"paper"}
            transitionDuration={{ exit: 0 }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {typeof content === "string" ? (
                    <DialogContentText>{content}</DialogContentText>
                ) : (
                    content
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>
                    {confirmLabel ? "Cancel" : "Ok"}
                </Button>
                {!!confirmLabel && (
                    <Button
                        onClick={() => onClose && onClose(true)}
                        color="primary"
                        autoFocus
                    >
                        {confirmLabel}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
