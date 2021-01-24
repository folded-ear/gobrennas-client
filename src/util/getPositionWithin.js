const getPositionWithin = (container, event) => {
    const scroll = document.scrollingElement;
    const x = event.clientX - container.offsetLeft + scroll.scrollLeft;
    const y = event.clientY - container.offsetTop + scroll.scrollTop;
    return [x, y];
};

export default getPositionWithin;
