import Fab from "@mui/material/Fab";
import React, { PropsWithChildren } from "react";
import dispatcher from "@/data/dispatcher";
import { styled } from "@mui/material/styles";
import { useIsMobile } from "@/providers/IsMobile";

type AddFabProps = {
    isMobile?: boolean;
};

const AddFab = styled(Fab, {
    shouldForwardProp: (prop) => prop !== "isMobile",
})<AddFabProps>(({ theme, isMobile }) => ({
    position: "fixed",
    bottom: isMobile ? theme.spacing(8) : theme.spacing(1),
    right: isMobile ? theme.spacing(1) : theme.spacing(4),
}));

type Props = PropsWithChildren<any>;

const FoodingerFab: React.FC<Props> = ({ children, ...props }) => {
    const isMobile = useIsMobile();
    React.useEffect(() => {
        setTimeout(() =>
            dispatcher.dispatch({
                type: "ui/show-fab",
            }),
        );
        return () => {
            setTimeout(() =>
                dispatcher.dispatch({
                    type: "ui/hide-fab",
                }),
            );
        };
    }, []);
    return (
        <AddFab isMobile={isMobile} color="primary" aria-label="add" {...props}>
            {children}
        </AddFab>
    );
};

export default FoodingerFab;
