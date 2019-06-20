const AccessLevel = {
    // VIEW: "VIEW",
    CHANGE: "CHANGE",
    ADMINISTER: "ADMINISTER",
};

// this isn't technically safe. but it practically is.
const levels = Object.keys(AccessLevel);

export const includesLevel = (levelGranted, levelToCheck) => {
    if (levelGranted == null) return false;
    if (levelToCheck == null) {
        throw new Error(`There is no 'null' access level`)
    }
    if (! AccessLevel.hasOwnProperty(levelGranted)) {
        throw new Error(`Unknown '${levelGranted}' access level`)
    }
    if (! AccessLevel.hasOwnProperty(levelToCheck)) {
        throw new Error(`Unknown '${levelToCheck}' access level`)
    }
    return levels.indexOf(levelToCheck) <= levels.indexOf(levelGranted);
};

export default AccessLevel;