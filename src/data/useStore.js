import React from "react";

const useStore = (store, calculateState, deps) => {
    const [state, setState] = React.useState(calculateState);
    React.useEffect(
        () => {
            const sub = store.addListener(() =>
                setState(calculateState()));
            return () => sub.remove();
        },
        deps, // eslint-disable-line react-hooks/exhaustive-deps
    );
    return state;
};

export default useStore;
