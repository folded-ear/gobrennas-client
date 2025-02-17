import * as React from "react";

const getPositionWithin = (
    container: HTMLElement,
    event: React.PointerEvent,
) => {
    const scroll = document.scrollingElement!;
    const x = event.clientX - container.offsetLeft + scroll.scrollLeft;
    const y = event.clientY - container.offsetTop + scroll.scrollTop;
    return [x, y];
};

export default getPositionWithin;
