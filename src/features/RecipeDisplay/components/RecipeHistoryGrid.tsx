import { RecipeHistory } from "global/types/types";
import { useProfile } from "../../../providers/Profile";
import {
    CircularProgress,
    Grid,
    Rating,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import { PlanItemStatus } from "../../../__generated__/graphql";
import { CookedItIcon, DeleteIcon } from "../../../views/common/icons";
import User from "../../../views/user/User";
import React, { useCallback } from "react";
import { useRateRecipeHistory } from "../../../data/hooks/useRateRecipeHistory";
import { BfsId } from "../../../global/types/identity";
import { DateTime } from "luxon";
import Markdown from "../../../views/common/Markdown";

interface Props {
    recipeId: BfsId;
    history: RecipeHistory[];
}
export default function RecipeHistoryGrid({ recipeId, history }: Props) {
    const profile = useProfile();
    const [setRating, { loading: rating, error: rateError }] =
        useRateRecipeHistory();
    const handleRatingChange = useCallback(
        (h, v) => {
            setRating(recipeId, h.id, v);
        },
        [recipeId, setRating],
    );
    return (
        <Grid item xs={12}>
            <Typography variant="h5">
                <Stack direction={"row"} gap={1}>
                    History
                    {rating && <CircularProgress size={"1em"} />}
                    {rateError}
                </Stack>
            </Typography>
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
                                    {PlanItemStatus.Completed === h.status ? (
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
                                <TableCell>
                                    {!!h.notes && <Markdown text={h.notes} />}
                                </TableCell>
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
