import { styled } from "@mui/material/styles";

export const SmallHeadline = styled("span")({
    fontFamily: "'Encode Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: "bold",
    overflow: "hidden",
    textOverflow: "ellipsis",
    padding: 0,
    margin: 0,
});

export const SmallLabel = styled("span")(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: `12px`,
}));
