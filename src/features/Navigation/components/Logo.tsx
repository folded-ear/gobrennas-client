import * as React from "react";
import {
    Menu as MenuClosedIcon,
    MenuOpen as MenuOpenIcon,
} from "@mui/icons-material";
import {
    Box,
    IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";

type LogoProps = {
    isExpanded: boolean
    onClick: () => void
}

const LogoWrapper = styled(Box)(({theme}) => ({
    display: "flex",
    padding: theme.spacing(1),
    alignContent: "space-between",
}))

const LogoText = styled("div")(({theme}) => ({
    flex: 1,
    paddingTop: theme.spacing(1),
    whiteSpace: "nowrap",
}))

export const Logo: React.FC<LogoProps> = ({isExpanded, onClick}) => (<LogoWrapper>
        <IconButton onClick={onClick}>
            {isExpanded ? <MenuOpenIcon/> : <MenuClosedIcon/>}
        </IconButton>
        <LogoText>
            {isExpanded ? "Food Software" : null}
        </LogoText>
    </LogoWrapper>
)