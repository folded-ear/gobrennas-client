import { AccessLevel } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import invariant from "invariant";

// ORDER MATTERS! Later levels imply earlier ones.
const levels = [AccessLevel.VIEW, AccessLevel.CHANGE, AccessLevel.ADMINISTER];

export function includesLevel(
    levelGranted: Maybe<AccessLevel>,
    levelToCheck: AccessLevel,
) {
    if (levelGranted == null) return false;
    invariant(levelToCheck != null, "There is no 'null' access level");
    if (import.meta.env.DEV) {
        invariant(
            levels.includes(levelGranted),
            `Unknown '${levelGranted}' access level`,
        );
        invariant(
            levels.includes(levelToCheck),
            `Unknown '${levelToCheck}' access level`,
        );
    }
    return levels.indexOf(levelToCheck) <= levels.indexOf(levelGranted);
}

export default AccessLevel;
