import * as React from "react";
import { ReactNode } from "react";
import { Button, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";

const ContainedIcon = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.neutral.main,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.neutral.contrastText,
    "&:hover": {
        backgroundColor: theme.palette.neutral.main,
    },
})) as typeof Button;

type TaskIconProps = {
    icon: ReactNode;
    url: string;
};

export const TaskIcon: React.FC<TaskIconProps> = ({ icon, url }) => {
    return (
        <ContainedIcon size="small" color="secondary" component={Link} to={url}>
            {icon}
        </ContainedIcon>
    );
};
