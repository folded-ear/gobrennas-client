export const toMilliseconds = (time) => {
    if (!time) return null;
    return time * 60 * 1000;
};

export const fromMilliseconds = (time) => {
    if (!time) return null;
    return time / (60 * 1000);
};

export const parseLocalDate = date => {
    if (!date) return null;
    if (!/^\d+-\d+-\d+(\D|$)/.test(date)) return null;
    const parts = date.split(/\D/)
        .slice(0, 3);
    if (parts[0] < 1000) return null;
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
