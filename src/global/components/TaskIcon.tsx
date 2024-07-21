import * as React from "react";
import { ReactNode } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";

const ContainedIcon = styled(Button)(({ theme }) => ({
    minWidth: "unset",
    padding: `${theme.spacing(0.5)} ${theme.spacing(0.75)}`,
    "& svg": {
        width: theme.spacing(2.5),
        height: theme.spacing(2.5),
    },
})) as typeof Button;

type TaskIconProps = {
    icon: ReactNode;
    url: string;
};

export const TaskIcon: React.FC<TaskIconProps> = ({ icon, url }) => {
    return (
        <ContainedIcon
            variant={"contained"}
            color="neutral"
            component={Link}
            to={url}
            disableElevation
        >
            {icon}
        </ContainedIcon>
    );
};
