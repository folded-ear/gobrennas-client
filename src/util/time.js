export const toMilliseconds = (time) => {
    if (!time) return null;
    return time * 60 * 1000;
};

export const fromMilliseconds = (time) => {
    if (!time) return null;
    return time / (60 * 1000);
};

export const parseLocalDate = date =>
    date == null ? null : new Date(...date.split(/\D/)
        .map((p, i) =>
            i === 1 ? p - 1 : p));

const pad = number => {
    if (number < 10) {
        return "0" + number;
    }
    return number;
};

export const formatLocalDate = date => {
    if (date == null) return null;
    return date.getFullYear() +
        "-" + pad(date.getMonth() + 1) +
        "-" + pad(date.getDate());
};
