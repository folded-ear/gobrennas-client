import { Maybe } from "graphql/jsutils/Maybe";

export const toMilliseconds = (time?: number) => {
    if (!time) return null;
    return time * 60 * 1000;
};

export const fromMilliseconds = (time?: number) => {
    if (time == null) return null;
    return time / (60 * 1000);
};

export const formatDuration = (minutes: number) => {
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

export const formatTimer = (seconds?: number) => {
    if (seconds == null || isNaN(seconds)) return "";
    const neg = seconds < 0;
    if (neg) seconds = -seconds;
    const hr = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    let result = hr === 0 ? "" + min : hr + ":" + pad(min);
    result += ":" + pad(sec);
    if (neg) result = "-" + result;
    return result;
};

const TEN_YEARS_FROM_NOW_THIS_CENTURY = (new Date().getFullYear() % 100) + 10;

export function parseLocalDate(date: Maybe<string>): Date | null {
    if (!date) return null;
    if (!/^\d+-\d+-\d+(\D|$)/.test(date)) return null;
    const parts = date
        .split(/\D/)
        .slice(0, 3)
        .map((p) => parseInt(p, 10)) as [number, number, number];
    if (parts.length !== 3) return null;
    if (parts.some((p) => isNaN(p))) return null;
    let year = parts.shift() as number; // parts is non-empty
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
}

function pad(number: number): string {
    if (number < 10) {
        return "0" + number;
    }
    return "" + number;
}

// don't use Maybe for the return type, as GraphQL params can't be undefined.
export function formatLocalDate(date: Maybe<Date>): string | null {
    if (!date) return null;
    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate())
    );
}

const humanDateFormatter = new Intl.DateTimeFormat("default", {
    month: "short",
    weekday: "short",
    day: "numeric",
});

export function humanDate(date?: Date): string {
    if (!date) return "";
    const tgt = new Date();
    if (
        date.getFullYear() === tgt.getFullYear() &&
        date.getMonth() === tgt.getMonth() &&
        date.getDate() === tgt.getDate()
    ) {
        return "Today";
    }
    tgt.setDate(tgt.getDate() - 1);
    if (
        date.getFullYear() === tgt.getFullYear() &&
        date.getMonth() === tgt.getMonth() &&
        date.getDate() === tgt.getDate()
    ) {
        return "Yesterday";
    }
    tgt.setDate(tgt.getDate() + 2);
    if (
        date.getFullYear() === tgt.getFullYear() &&
        date.getMonth() === tgt.getMonth() &&
        date.getDate() === tgt.getDate()
    ) {
        return "Tomorrow";
    }
    if (Math.abs(tgt.valueOf() - date.valueOf()) < 86400 * 1000 * 90) {
        return humanDateFormatter.format(date);
    }
    return date.toLocaleDateString();
}
