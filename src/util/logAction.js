const logAction = action => {
    const temp = {...action};
    delete temp.type;
    const keys = Object.keys(temp);
    const args = ["FLUX>", typeof action.type === "string"
        ? action.type
        : action.type.toString()];
    if (keys.length === 1) {
        args.push(keys[0], action[keys[0]])
    } else {
        args.push(temp);
    }
    console.log(...args);
};

export default logAction;