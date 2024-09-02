import { styled } from "@mui/material/styles";
import { Box, Card } from "@mui/material";

export const Item = styled("div")({
    border: `1px solid red`,
});

export const SearchResults = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: `0 ${theme.spacing(2)}`,
}));

export const NanoRecipeCard = styled(Card)(({ theme }) => ({
    display: "flex",
    border: `1px solid ${theme.palette.grey["600"]}`,
    borderRadius: theme.shape.borderRadius,
}));

export const NanoCardContent = styled("div")(({ theme }) => ({
    padding: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
}));
