import { useMediaQuery } from "@mui/material";
import React, {
    createContext,
    PropsWithChildren,
    useContext,
} from "react";
import theme from "../theme";

const MobileContext = createContext(true);

export function IsMobileProvider({ children }: PropsWithChildren): JSX.Element {
    const bound = theme.breakpoints.values.sm;
    const query = `@media (max-width:${bound}px), (max-height:${bound}px)`;
    const mobile = useMediaQuery(query, {
        noSsr: true, // don't double-render
    });
    return <MobileContext.Provider value={mobile}>
        {children}
    </MobileContext.Provider>;
}

export const useIsMobile = () =>
    useContext(MobileContext);
