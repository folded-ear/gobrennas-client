import invariant from "invariant";
import { Maybe } from "graphql/jsutils/Maybe";

enum AccessLevel {
    // noinspection JSUnusedGlobalSymbols
    VIEW = "VIEW",
    CHANGE = "CHANGE",
    ADMINISTER = "ADMINISTER",
}

// this isn't technically safe. but it practically is.
const levels = Object.keys(AccessLevel);

export function includesLevel(
    levelGranted: Maybe<AccessLevel>,
    levelToCheck: AccessLevel,
) {
    if (levelGranted == null) return false;
    invariant(levelToCheck != null, "There is no 'null' access level");
    invariant(
        AccessLevel.hasOwnProperty(levelGranted),
        `Unknown '${levelGranted}' access level`,
    );
    invariant(
        AccessLevel.hasOwnProperty(levelToCheck),
        `Unknown '${levelToCheck}' access level`,
    );
    return levels.indexOf(levelToCheck) <= levels.indexOf(levelGranted);
}

export default AccessLevel;
