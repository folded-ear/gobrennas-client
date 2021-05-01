export const toMilliseconds = (time) => {
    if (!time) return null;
    return time * 60 * 1000;
};

export const fromMilliseconds = (time) => {
    if (!time) return null;
    return time / (60 * 1000);
};

export const formatDuration = minutes => {
    minutes = Math.ceil(minutes); // round up
    if (minutes < 60) {
        const unit = minutes === 1 ? "minute" : "minutes";
        return `${minutes} ${unit}`;
    }
    const hours = Math.floor(minutes / 60);
    minutes %= 60;
    if (minutes === 0) {
        const unit = hours === 1 ? "hour" : "hours";
        return `${hours} ${unit}`;
    } else {
        const unit = hours === 1 ? "hr" : "hrs";
        return `${hours} ${unit} ${minutes} min`;
    }
};

const TEN_YEARS_FROM_NOW_THIS_CENTURY = new Date().getFullYear() % 100 + 10;
export const parseLocalDate = date => {
    if (!date) return null;
    if (!/^\d+-\d+-\d+(\D|$)/.test(date)) return null;
    const parts = date.split(/\D/)
        .slice(0, 3)
        .map(p => parseInt(p, 10));
    if (parts.some(p => isNaN(p))) return null;
    let year = parts.shift();
    if (year < 0) return null;
    if (year <= TEN_YEARS_FROM_NOW_THIS_CENTURY) {
        year += 2000;
    } else if (year < 100) {
        year += 1900;
    }
    if (year < 1000) return null;
    parts.unshift(year);
    parts[1] -= 1;
    return new Date(...parts);
};

const pad = number => {
    if (number < 10) {
        return "0" + number;
    }
    return number;
};

export const formatLocalDate = date => {
    if (!date) return null;
    return date.getFullYear() +
        "-" + pad(date.getMonth() + 1) +
        "-" + pad(date.getDate());
};

const humanDateFormatter = new Intl.DateTimeFormat("default", {
    month: "short",
    weekday: "short",
    day: "numeric",
});
export const humanDate = date =>
    date ? humanDateFormatter.format(date) : "";
