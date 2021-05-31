import { useMediaQuery } from "@material-ui/core";
import theme from "../theme";

const useIsMobile = () => {
    const bound = theme.breakpoints.values.sm;
    const query = `@media (max-width:${bound}px), (max-height:${bound}px)`;
    return useMediaQuery(query, {
        noSsr: true, // don't double-render
    });
};

export default useIsMobile;
