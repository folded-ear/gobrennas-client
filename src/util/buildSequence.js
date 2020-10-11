const buildSequence = () => {
    const PREFIX = Math.floor(Date.now() + 0x10000 + Math.random() * 0xeffff).toString(36) + "_";
    let counter = 0;
    const next = () =>
        PREFIX + (++counter).toString(36);
    return {
        PREFIX,
        next,
    };
};

export default buildSequence;
