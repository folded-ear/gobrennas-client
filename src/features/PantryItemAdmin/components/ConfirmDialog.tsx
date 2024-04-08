import React, { ReactNode, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, DialogContent, DialogContentText } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";

export interface DialogProps {
    title?: string;
    content?: ReactNode;
    confirmLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export default function ConfirmDialog({
    title,
    content,
    confirmLabel,
    onConfirm,
    onCancel,
}: DialogProps) {
    const [open, setOpen] = React.useState(false);
    const handleCancel = () => {
        setOpen(false);
        onCancel && onCancel();
    };
    useEffect(() => {
        setOpen(!!title);
    }, [title]); // todo: this is the wrong thing - can't reopen the "same" dialog
    return (
        <Dialog open={open} onClose={handleCancel} scroll={"paper"}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {typeof content === "string" ? (
                    <DialogContentText>{content}</DialogContentText>
                ) : (
                    content
                )}
            </DialogContent>
            <DialogActions>
                {onCancel && <Button onClick={handleCancel}>Cancel</Button>}
                <Button
                    onClick={() => {
                        setOpen(false);
                        onConfirm && onConfirm();
                    }}
                    color="primary"
                    autoFocus
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
