import { Container, ContainerProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import classnames from "classnames";
import { ReactNode } from "react";
import { HEADER_HEIGHT } from "@/constants/layout";

const useStyles = makeStyles((theme) => {
    return {
        root: {
            backgroundColor: theme.palette.background.paper,
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        },
        fullWidth: {
            paddingLeft: 0,
            paddingRight: 0,
        },
        noFab: {
            paddingBottom: theme.spacing(2),
        },
        hasFab: {
            paddingBottom: theme.spacing(7),
        },
    };
});

type PageBodyProps = {
    children: ReactNode;
    hasFab?: boolean;
    fullWidth?: boolean;
    className?: string;
    id?: string;
} & ContainerProps;

const PageBody = (props: PageBodyProps) => {
    const classes = useStyles();
    const { fullWidth, hasFab, className, ...passthrough } = props;
    return (
        <Container
            className={classnames(classes.root, className, {
                [classes.fullWidth]: fullWidth,
                [classes.hasFab]: hasFab,
                [classes.noFab]: !hasFab,
            })}
            {...passthrough}
        />
    );
};

export default PageBody;
