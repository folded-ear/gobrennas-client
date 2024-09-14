import { styled } from "@mui/material/styles";
import { Box, Card } from "@mui/material";

export const SearchResults = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: `0 ${theme.spacing(2)}`,
}));

export const NanoRecipeCard = styled(Card)(({ theme }) => ({
    display: "flex",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
}));

export const NanoCardContent = styled("div")(({ theme }) => ({
    padding: theme.spacing(1),
    display: "flex",
    width: "80%",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
}));
