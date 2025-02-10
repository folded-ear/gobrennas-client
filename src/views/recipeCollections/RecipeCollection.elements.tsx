import { Box, Card } from "@mui/material";
import { styled } from "@mui/material/styles";

export const SearchResults = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: `0 ${theme.spacing(2)}`,
}));

export const NanoRecipeCard = styled(Card)(({ theme }) => ({
    display: "flex",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    width: "100%",
}));

export const NanoCardContent = styled("div")(({ theme }) => ({
    padding: `0 ${theme.spacing(0.5)}`,
    display: "flex",
    width: "80%",
    flexDirection: "column",
}));
