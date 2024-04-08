import { Delete as DeleteIcon } from "@mui/icons-material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import React from "react";
import { Result } from "../../../data/hooks/usePantryItemSearch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, DialogContent, DialogContentText } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";

interface Props {
    row: Result;
    onDelete: (id: string) => void;
}

export default function DeleteItemAction({ row, onDelete }: Props) {
    const title = `Delete '${row.name}'`;
    const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);
    return (
        <>
            <GridActionsCellItem
                label={title}
                title={title}
                icon={<DeleteIcon />}
                disabled={row.useCount > 0}
                onClick={() => setOpen(true)}
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete '{row.name}'?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={() => {
                            onDelete(row.id);
                            handleClose();
                        }}
                        color="primary"
                        autoFocus
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
