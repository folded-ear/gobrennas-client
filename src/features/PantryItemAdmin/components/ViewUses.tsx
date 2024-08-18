import { Result } from "@/data/hooks/usePantryItemSearch";
import { usePantryItemUses } from "@/data/hooks/usePantryItemUses";
import {
    CircularProgress,
    DialogContentText,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import User from "@/views/user/User";
import { PlusIcon } from "@/views/common/icons";
import ListItemIcon from "@mui/material/ListItemIcon";

interface Props {
    row: Result;
}
export default function ViewUses({ row }: Props) {
    const { loading, error, data } = usePantryItemUses(row.id);
    if (error) {
        return <DialogContentText>{error.message}</DialogContentText>;
    }
    if (loading || !data) {
        return <CircularProgress />;
    }
    const recipeUseCount = data.reduce((t, r) => t + r.uses.length, 0);
    return (
        <List dense sx={{ my: -2 }}>
            {data?.map((r) => (
                <ListItem
                    key={r.id}
                    alignItems="flex-start"
                    sx={{ gap: 4 }}
                    disableGutters
                >
                    <ListItemAvatar sx={{ minWidth: "unset" }}>
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
            {recipeUseCount < row.useCount && (
                <ListItem disableGutters>
                    {data.length > 0 && (
                        <ListItemIcon>
                            <PlusIcon />
                        </ListItemIcon>
                    )}
                    <ListItemText>
                        {row.useCount - recipeUseCount} more
                    </ListItemText>
                </ListItem>
            )}
        </List>
    );
}
