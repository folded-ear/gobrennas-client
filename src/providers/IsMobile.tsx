import {useMediaQuery} from "@mui/material";
import React, {createContext, PropsWithChildren, useContext,} from "react";
import theme from "../theme";
import useFluxStore from "../data/useFluxStore";
import preferencesStore from "../data/preferencesStore";

const MobileContext = createContext(true);

export function IsMobileProvider({ children }: PropsWithChildren): JSX.Element {
    const bound = theme.breakpoints.values.sm;
    const query = `@media (max-width:${bound}px), (max-height:${bound}px)`;
    const mobile = useMediaQuery(query, {
        noSsr: true, // don't double-render
    });
    const layout = useFluxStore(
        () => preferencesStore.getLayout(),
        [preferencesStore]
    );
    const value = layout === "desktop"
        ? false
        : layout === "mobile"
            ? true
            : mobile;
    return <MobileContext.Provider value={value}>
        {children}
    </MobileContext.Provider>;
}

export const useIsMobile = () =>
    useContext(MobileContext);
