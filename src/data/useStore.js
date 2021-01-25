import React from "react";

const useStore = (calculateState, store, deps) => {
    const [state, setState] = React.useState(calculateState);
    React.useEffect(
        () => {
            const sub = store.addListener(() => setState(calculateState()));
            return () => sub.remove();
        },
        [calculateState, store],
    );
    React.useEffect(
        () => setState(calculateState()),
        [calculateState, ...deps] // eslint-disable-line react-hooks/exhaustive-deps
    );
    return state;
};

export default useStore;
