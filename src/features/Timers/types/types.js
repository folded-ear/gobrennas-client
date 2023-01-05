import PropTypes from "prop-types";

export const timerType = PropTypes.shape({
    id: PropTypes.string.isRequired,
    initialDuration: PropTypes.number,
    duration: PropTypes.number.isRequired,
    remaining: PropTypes.number.isRequired,
    paused: PropTypes.bool.isRequired,
});

export const arrayOfTimersType = PropTypes.arrayOf(timerType);
