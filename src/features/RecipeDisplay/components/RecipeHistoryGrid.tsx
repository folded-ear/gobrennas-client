import { RecipeHistory } from "@/global/types/types";
import { useProfile } from "@/providers/Profile";
import {
    Alert,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    Rating,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import { PlanItemStatus } from "@/__generated__/graphql";
import { CookedItIcon, DeleteIcon, EditIcon } from "@/views/common/icons";
import User from "@/views/user/User";
import React, { useCallback, useState } from "react";
import { useSetRecipeHistoryRating } from "@/data/hooks/useSetRecipeHistoryRating";
import { BfsId } from "@/global/types/identity";
import { DateTime } from "luxon";
import Markdown from "@/views/common/Markdown";
import { useSetRecipeHistoryNotes } from "@/data/hooks/useSetRecipeHistoryNotes";

interface NotesCellProps {
    value: string | null;
    onChange: (v: string) => void;
}

function NotesCell({ value, onChange }: NotesCellProps) {
    const [val, setVal] = useState("");
    const [open, setOpen] = useState(false);
    function handleEdit(e: React.MouseEvent) {
        e.preventDefault();
        setVal(value || "");
        setOpen(true);
    }
    function handleChange(e: React.ChangeEvent) {
        const { value } = e.target as HTMLTextAreaElement;
        setVal(value);
    }
    function handleCancel(e: React.MouseEvent) {
        e.preventDefault();
        setVal("");
        setOpen(false);
    }
    function handleOk(e: React.MouseEvent) {
        onChange(val);
        handleCancel(e);
    }
    return (
        <TableCell
            sx={{
                position: "relative",
                "&:hover button:first-child svg": {
                    visibility: "visible",
                },
            }}
        >
            {open ? (
                <Stack gap={0.5}>
                    <TextField
                        value={val}
                        onChange={handleChange}
                        variant={"outlined"}
                        size={"small"}
                        multiline
                        minRows={4}
                    />
                    <Stack
                        direction={"row"}
                        justifyContent={"flex-end"}
                        gap={1}
                    >
                        <Button onClick={handleCancel} variant={"outlined"}>
                            Cancel
                        </Button>
                        <Button onClick={handleOk} variant={"contained"}>
                            Ok
                        </Button>
                    </Stack>
                </Stack>
            ) : (
                <>
                    <IconButton
                        onClick={handleEdit}
                        size={"small"}
                        sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            visibility: "hidden",
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    {!!value && <Markdown text={value} />}
                </>
            )}
        </TableCell>
    );
}

interface Props {
    recipeId: BfsId;
    history: RecipeHistory[];
}

export default function RecipeHistoryGrid({ recipeId, history }: Props) {
    const profile = useProfile();
    const [setRating, { loading: settingRating, error: ratingError }] =
        useSetRecipeHistoryRating();
    const [setNotes, { loading: settingNotes, error: notesError }] =
        useSetRecipeHistoryNotes();
    const handleRatingChange = useCallback(
        (h: RecipeHistory, v: number | null) =>
            v != null && setRating(recipeId, h.id, v),
        [recipeId, setRating],
    );
    const handleNotesChange = useCallback(
        (h: RecipeHistory, n: string) => setNotes(recipeId, h.id, n),
        [recipeId, setNotes],
    );
    return (
        <Grid item xs={12}>
            <Typography variant="h5">
                <Stack direction={"row"} gap={1}>
                    History
                    {(settingRating || settingNotes) && (
                        <CircularProgress size={"1em"} />
                    )}
                </Stack>
            </Typography>
            {(ratingError || notesError) && (
                <Alert severity={"error"}>
                    {(ratingError || notesError)?.message}
                </Alert>
            )}
            <Table
                size={"small"}
                sx={{
                    "tr td": {
                        verticalAlign: "top",
                    },
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Planned</TableCell>
                        <TableCell>Done</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((h) => {
                        const mine = h.owner.email === profile.email;
                        return (
                            <TableRow key={h.id}>
                                <TableCell>
                                    {PlanItemStatus.COMPLETED === h.status ? (
                                        <CookedItIcon />
                                    ) : (
                                        <DeleteIcon />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {DateTime.fromISO(
                                        h.plannedAt,
                                    ).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {DateTime.fromISO(
                                        h.doneAt,
                                    ).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {(mine || !!h.rating) && (
                                        <Rating
                                            value={h.rating}
                                            disabled={!mine}
                                            onChange={(_, r) =>
                                                handleRatingChange(h, r)
                                            }
                                        />
                                    )}
                                </TableCell>
                                <NotesCell
                                    value={h.notes}
                                    onChange={(n) => handleNotesChange(h, n)}
                                />
                                <TableCell>
                                    <User {...h.owner} iconOnly inline />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Grid>
    );
}
