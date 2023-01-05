import {
    useEffect,
    useState,
} from "react";
import PropTypes from "prop-types";
import { formatTimer } from "../../../util/time";

const seconds = since =>
    (Date.now() - since) / 1000;

function TimeSince({ // todo: collapse this and Countdown
                       when,
                   }) {
    const [ sec, setSec ] = useState(seconds(when));
    useEffect(
        () => {
            const id = setInterval(() => {
                setSec(seconds(when));
            }, 1000);
            return () => clearInterval(id);
        },
        [ when ],
    );
    return formatTimer(sec);
}

TimeSince.propTypes = {
    when: PropTypes.number.isRequired,
};

export default TimeSince;
