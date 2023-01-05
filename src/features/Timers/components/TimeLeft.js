import {
    useEffect,
    useState,
} from "react";
import { formatTimer } from "../../../util/time";
import { timerType } from "../types/types";

const seconds = since =>
    Math.abs(Date.now() - since) / 1000;

function Updater({ when }) {
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

function TimeLeft({
                      timer: {
                          endAt,
                          remaining,
                          paused,
                      },
                  }) {
    return paused
        ? formatTimer(remaining)
        : <Updater when={endAt} />;
}

TimeLeft.propTypes = {
    timer: timerType.isRequired,
};

export default TimeLeft;
