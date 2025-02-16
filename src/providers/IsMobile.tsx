import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "@/data/useFluxStore";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import { createContext, PropsWithChildren, useContext } from "react";

const MobileContext = createContext(true);

type Props = PropsWithChildren<unknown>;

export function IsMobileProvider({ children }: Props): React.ReactElement {
    const bound = useTheme().breakpoints.values.sm;
    const query = `@media (max-width:${bound}px), (max-height:${bound}px)`;
    const mobile = useMediaQuery(query, {
        noSsr: true, // don't double-render
    });
    const layout = useFluxStore(
        () => preferencesStore.getLayout(),
        [preferencesStore],
    );
    const value =
        layout === "desktop" ? false : layout === "mobile" ? true : mobile;
    return (
        <MobileContext.Provider value={value}>
            {children}
        </MobileContext.Provider>
    );
}

export const useIsMobile = () => useContext(MobileContext);
