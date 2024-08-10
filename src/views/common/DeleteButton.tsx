import { Button, ButtonProps, IconButton, Tooltip } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { DeleteIcon } from "@/views/common/icons";
import * as React from "react";
import { MouseEventHandler } from "react";

interface Props {
    onClick: MouseEventHandler;
}

const DeleteIconButton: React.FC<Props> = ({ onClick, ...props }) => (
    <Tooltip title="Delete" placement="top">
        <IconButton onClick={onClick} {...props}>
            <DeleteIcon />
        </IconButton>
    </Tooltip>
);

type DeleteButtonProps = {
    forType: string;
    onConfirm(): void;
    label?: string;
    onClick?(): void;
    onCancel?(): void;
    className?: string;
} & ButtonProps;

const DeleteButton: React.FC<DeleteButtonProps> = ({
    forType,
    onConfirm,
    label,
    onClick,
    onCancel,
    ...props
}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = (e) => {
        e.stopPropagation();
        setOpen(true);
        onClick && onClick();
    };
    const handleClose = () => setOpen(false);
    const handleCancel = (e) => {
        e.stopPropagation();
        setOpen(false);
        onCancel && onCancel();
    };
    const handleConfirm = (e) => {
        e.stopPropagation();
        setOpen(false);
        onConfirm && onConfirm();
    };
    return (
        <>
            {label ? (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpen}
                    {...props}
                >
                    {label}
                </Button>
            ) : (
                <DeleteIconButton onClick={handleOpen} {...props} />
            )}
            <Dialog
                open={open}
                maxWidth="xs"
                onClose={handleClose}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">
                    Irrevocably delete this {forType}?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleConfirm} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteButton;
