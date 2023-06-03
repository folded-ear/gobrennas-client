import Fab from "@mui/material/Fab";
import React, { PropsWithChildren } from "react";
import dispatcher from "../../data/dispatcher";
import UiActions from "../../data/UiActions";
import { styled } from "@mui/material/styles";
import { useIsMobile } from "providers/IsMobile";

type AddFabProps = {
    isMobile?: boolean
}

const AddFab = styled(Fab)<AddFabProps>(({theme, isMobile}) => ({
    position: "fixed",
    bottom: isMobile ? theme.spacing(8) : theme.spacing(3),
    right: theme.spacing(4),
}));

type Props = PropsWithChildren<any>;

const FoodingerFab: React.FC<Props> = ({
                                           children,
                                           ...props
                                       }) => {
    const isMobile = useIsMobile();
    React.useEffect(() => {
        setTimeout(() => dispatcher.dispatch({
            type: UiActions.SHOW_FAB,
        }));
        return () => {
            setTimeout(() => dispatcher.dispatch({
                type: UiActions.HIDE_FAB,
            }));
        };
    }, []);
    return <AddFab
        isMobile={isMobile}
        color="primary"
        aria-label="add"
        {...props}
    >
        {children}
    </AddFab>;
};

export default FoodingerFab;
