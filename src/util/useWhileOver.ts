import { useState } from "react";

const useWhileOver = () => {
    const [over, setOver] = useState(false);
    // noinspection JSUnusedGlobalSymbols
    const sensorProps = {
        onMouseEnter: () => setOver(true),
        onMouseLeave: () => setOver(false),
    };
    return {
        over,
        sensorProps,
    };
};

export default useWhileOver;
