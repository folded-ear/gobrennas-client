const endsWith = (taskOrName, char) => {
    const name = taskOrName === "string"
        ? taskOrName
        : taskOrName.name;
    if (name == null) return false;
    if (name.length === 0) return false;
    return name.charAt(name.length - 1) === char;
};

export const isSection = taskOrName =>
    endsWith(taskOrName, ":");

export const isQuestionable = taskOrName =>
    endsWith(taskOrName, "?");

