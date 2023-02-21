import PropTypes from "prop-types";
import React from "react";
import useWindowSize from "../../data/useWindowSize";
import debounce from "../../util/debounce";

function LazyInfinite({children, complete, onNeedMore, loading}) {
    const windowSize = useWindowSize();
    const ref = React.createRef<HTMLDivElement>();
    React.useEffect(
        () => {
            if (loading || complete || !ref.current) return;
            if (ref.current.scrollHeight < 2 * windowSize.height) {
                onNeedMore();
                return;
            }
            const handler = debounce(() => {
                if (!ref.current) return;
                if (ref.current.scrollHeight - window.scrollY < 2 * windowSize.height) {
                    onNeedMore();
                }
            });
            window.addEventListener("scroll", handler);
            return () =>
                window.removeEventListener("scroll", handler);
        },
        [ref, onNeedMore, windowSize, complete, loading]
    );
    return <div ref={ref}>
        {children}
    </div>;
}

LazyInfinite.propTypes = {
    onNeedMore: PropTypes.func.isRequired,
    children: PropTypes.node,
    complete: PropTypes.bool,
    loading: PropTypes.bool,
};

export default LazyInfinite;
