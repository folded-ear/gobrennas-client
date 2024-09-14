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

export const SectionHeadline = styled("h3")(({ theme }) => ({
    fontFamily: "'Encode Sans', sans-serif",
    fontSize: "1.2rem",
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const SmallLabel = styled("span")(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: `12px`,
}));
