import { HEADER_HEIGHT } from "@/constants/layout";
import useWindowSize from "@/data/useWindowSize";
import { Box, useScrollTrigger } from "@mui/material";
import * as React from "react";
import { CSSProperties, PropsWithChildren } from "react";

type Props = PropsWithChildren;

export const SubHeader: React.FC<Props> = ({ children }) => {
    const windowSize = useWindowSize();
    const [height, setHeight] = React.useState<CSSProperties["height"]>("auto");
    const [width, setWidth] = React.useState<CSSProperties["width"]>("auto");
    const inner = React.useRef<HTMLDivElement>(null);
    React.useLayoutEffect(() => {
        setHeight(inner?.current?.clientHeight);
        setWidth((inner?.current?.parentNode as HTMLElement).clientWidth);
    }, [windowSize.width]);
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        // roughly the spacing 2
        threshold: 20,
    });

    return (
        <div style={{ height }}>
            <Box
                ref={inner}
                style={
                    trigger
                        ? {
                              position: "fixed",
                              width,
                              top: HEADER_HEIGHT,
                              // appbar zindex
                              zIndex: 1100,
                          }
                        : undefined
                }
            >
                {children}
            </Box>
        </div>
    );
};
