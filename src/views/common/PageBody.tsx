import { Container, ContainerProps } from "@mui/material";
import { ReactNode } from "react";

type PageBodyProps = {
    children: ReactNode;
    hasFab?: boolean;
    fullWidth?: boolean;
    className?: string;
    id?: string;
} & ContainerProps;

const PageBody = (props: PageBodyProps) => {
    const { fullWidth, hasFab, className, ...rest } = props;
    return (
        <Container
            sx={(theme) => ({
                backgroundColor: theme.palette.background.paper,
                minHeight: "100vh",
            })}
            {...rest}
        />
    );
};

export default PageBody;
