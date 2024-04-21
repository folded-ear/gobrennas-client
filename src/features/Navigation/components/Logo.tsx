import * as React from "react";
import { MenuClosedIcon, MenuOpenIcon } from "views/common/icons";
import { ListItemButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ItemIcon } from "./Navigation.elements";

type LogoProps = {
    expanded: boolean;
    onClick: () => void;
};

const LogoText = styled("div")(({ theme }) => ({
    whiteSpace: "nowrap",
    fontSize: "120%",
    position: "relative",
}));

const B = styled("span")(({ theme }) => ({
    transform: "scaleX(-1)",
    display: "inline-block",
    color: theme.palette.primary.main,
    position: "absolute",
    right: "100%",
}));

export const Logo: React.FC<LogoProps> = ({ expanded, onClick }) => (
    <ListItemButton onClick={onClick}>
        <ItemIcon
            open={expanded}
            sx={{
                py: 1,
            }}
        >
            {expanded ? <MenuOpenIcon /> : <MenuClosedIcon />}
        </ItemIcon>
        {expanded ? (
            <LogoText>
                <B>B</B>
                Food Software
            </LogoText>
        ) : null}
    </ListItemButton>
);
