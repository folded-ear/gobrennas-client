import { Result } from "../../../data/hooks/usePantryItemSearch";
import { usePantryItemUses } from "../../../data/hooks/usePantryItemUses";
import {
    CircularProgress,
    DialogContentText,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import User from "../../../views/user/User";

interface Props {
    row: Result;
}
export default function ViewUses({ row }: Props) {
    const { loading, error, data } = usePantryItemUses(row.id);
    if (loading) {
        return <CircularProgress />;
    }
    if (error) {
        return <DialogContentText>{error}</DialogContentText>;
    }
    return (
        <List dense sx={{ my: -2 }}>
            {data?.map((r) => (
                <ListItem
                    key={r.id}
                    alignItems="flex-start"
                    sx={{ gap: 4 }}
                    disableGutters
                >
                    <ListItemAvatar sx={{ order: 2, minWidth: "unset" }}>
                        <User inline {...r.owner} iconOnly />
                    </ListItemAvatar>
                    <ListItemText>
                        <Typography variant={"h5"} component={"h3"}>
                            {r.name}
                        </Typography>
                        {r.uses.map((u, i) => (
                            <p key={i}>{u}</p>
                        ))}
                    </ListItemText>
                </ListItem>
            ))}
        </List>
    );
}
