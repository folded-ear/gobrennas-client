import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";

export const TaskBar = styled("div")(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
}));

export const TaskBarButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.neutral.main,
    padding: theme.spacing(1),
    width: "25px",
    height: "25px",
    "& svg": {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
})) as typeof IconButton;
