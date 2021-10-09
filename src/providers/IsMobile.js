import { useMediaQuery } from "@material-ui/core";
import PropTypes from "prop-types";
import React, {
    createContext,
    useContext,
} from "react";
import theme from "../theme";

const MobileContext = createContext(true);

export function IsMobileProvider({children}) {
    const bound = theme.breakpoints.values.sm;
    const query = `@media (max-width:${bound}px), (max-height:${bound}px)`;
    const mobile = useMediaQuery(query, {
        noSsr: true, // don't double-render
    });
    return <MobileContext.Provider value={mobile}>
        {children}
    </MobileContext.Provider>;
}

IsMobileProvider.propTypes = {
    children: PropTypes.node,
};

export const useIsMobile = () =>
    useContext(MobileContext);
