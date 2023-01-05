import {
    useEffect,
    useState,
} from "react";
import PropTypes from "prop-types";
import { formatTimer } from "../../../util/time";
import { timerType } from "../types/types";

const secondsLeft = end =>
    (end - Date.now()) / 1000;

function Updater({
                     when,
                     overageIndicator,
                 }) {
    const [ sec, setSec ] = useState(secondsLeft(when));
    useEffect(
        () => {
            const update = () => setSec(secondsLeft(when));
            const id = setInterval(update, 1000);
            update();
            return () => clearInterval(id);
        },
        [ when ],
    );
    return (sec < 0 ? overageIndicator : "") + formatTimer(Math.abs(sec));
}

function TimeLeft({
                      timer: {
                          endAt,
                          remaining,
                          paused,
                      },
                      overageIndicator = "",
                  }) {
    return paused
        ? formatTimer(remaining)
        : <Updater when={endAt} overageIndicator={overageIndicator} />;
}

TimeLeft.propTypes = {
    timer: timerType.isRequired,
    overageIndicator: PropTypes.string,
};

export default TimeLeft;
