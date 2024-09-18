import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";

export const SectionHeadline = styled("h3")(({ theme }) => ({
    fontFamily: "'Encode Sans', sans-serif",
    fontSize: "1.2rem",
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const LinkTitle = styled(Link)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontFamily: "'Encode Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: "bold",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    padding: 0,
    textOverflow: "ellipsis",
    textDecoration: "none",
}));
