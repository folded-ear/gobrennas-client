let data = {};
const GTag = (cmd, ...rest) => {
    if (cmd === "set") {
        if (typeof rest[0] === "string") {
            data[rest[0]] = rest[1];
        } else {
            data = {
                ...data,
                ...rest[0],
            };
        }
    } else if (cmd === "event") {
        // eslint-disable-next-line no-console
        console.log("GA", rest[0], data.page_path, data);
    }
};

export default process.env.NODE_ENV === "production"
    ? window.gtag
    : GTag;
