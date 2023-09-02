import { Container } from "@mui/material";
import {
    CreateCSSProperties,
    makeStyles
} from "@mui/styles";
import classnames from "classnames";
import React from "react";
import { HEADER_HEIGHT } from "../../constants/layout";

const useStyles = makeStyles(theme => {
    return ({
        root: (props: PageBodyProps) => {
            const styles: CreateCSSProperties = {
                backgroundColor: "white",
                minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
                paddingBottom: theme.spacing(2),
            };
            if (props.fullWidth) {
                styles.paddingLeft = 0;
                styles.paddingRight = 0;
            }
            return styles;
        },
        hasFab: {
            paddingBottom: theme.spacing(7),
        }
    });
});

type PageBodyProps = {
    children: any,
    hasFab?: boolean,
    fullWidth?: boolean,
    className?: string,
    id?: string,
}

const PageBody: React.FC<PageBodyProps> = (props) => {
    const {
        children,
        hasFab,
        fullWidth,
        className,
        ...passthrough
    } = props;
    const classes = useStyles(props);
    return <Container
        className={classnames(classes.root, className, {
            [classes.hasFab]: hasFab,
        })}
        {...passthrough}
    >
        {children}
    </Container>;
};

export default PageBody;
