import {
    useEffect,
    useState,
} from "react";
import PropTypes from "prop-types";
import { formatTimer } from "../../../util/time";

function Countdown({ // todo: collapse this and TimeSince
                       remaining,
                       paused,
                   }) {
    const [ sec, setSec ] = useState(remaining);
    useEffect(
        () => {
            if (paused) {
                setSec(remaining);
                return;
            }
            const start = Date.now();
            const id = setInterval(() => {
                const elapsed = Math.ceil((Date.now() - start) / 1000);
                setSec(remaining - elapsed);
            }, 1000);
            return () => clearInterval(id);
        },
        [ remaining, paused ],
    );
    return formatTimer(sec);
}

Countdown.propTypes = {
    remaining: PropTypes.number.isRequired,
    paused: PropTypes.bool,
    step: PropTypes.func,
};

export default Countdown;
