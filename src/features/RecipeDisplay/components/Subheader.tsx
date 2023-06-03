import React, {
    CSSProperties,
    PropsWithChildren
} from "react";
import useWindowSize from "../../../data/useWindowSize";
import {
    Box,
    useScrollTrigger
} from "@mui/material";
import { HEADER_HEIGHT } from "../../../constants/layout";

export const SubHeader: React.FC<PropsWithChildren> = ({ children }) => {
    const windowSize = useWindowSize();
    const [ height, setHeight ] = React.useState<CSSProperties["height"]>("auto");
    const [ width, setWidth ] = React.useState<CSSProperties["width"]>("auto");
    const inner = React.useRef<HTMLDivElement>();
    React.useLayoutEffect(() => {
        setHeight(inner?.current?.clientHeight);
        setWidth((inner?.current?.parentNode as HTMLElement).clientWidth);
    }, [ windowSize.width ]);
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        // roughly the spacing 2
        threshold: 20,
    });

    return <div
        style={{height}}
    >
        <Box
            ref={inner}
            style={trigger ? {
                position: "fixed",
                width,
                top: HEADER_HEIGHT,
                // appbar zindex
                zIndex: 1100,
            } : undefined}
        >
            {children}
        </Box>
    </div>;
};
