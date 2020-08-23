import RPTSecret from "prop-types/lib/ReactPropTypesSecret";
import LoadObject from "./LoadObject";
import {
    createChainableTypeChecker,
    getClassName,
    PropTypeError,
} from "./typeHelpers";

const loadObjectOf = (valueTypeChecker, optionalErrorTypeChecker) =>
    createChainableTypeChecker((
        props,
        propName,
        componentName,
        location,
        propFullName,
    ) => {
        if (typeof valueTypeChecker !== "function" || (optionalErrorTypeChecker != null && typeof optionalErrorTypeChecker !== "function")) {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside loadObjectOf.");
        }
        const lo = props[propName];
        if (!(lo instanceof LoadObject)) {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + getClassName(lo) + "` supplied to `" + componentName + "`, expected instance of `LoadObject`.");
        }
        if (lo.hasValue()) {
            const error = valueTypeChecker(
                {value: lo.getValueEnforcing()},
                "value",
                "LoadObject",
                location,
                propFullName + ".value",
                RPTSecret,
            );
            if (error != null) return error;
        }
        if (optionalErrorTypeChecker != null && lo.hasError()) {
            const error = valueTypeChecker(
                {error: lo.getErrorEnforcing()},
                "error",
                "LoadObject",
                location,
                propFullName + ".error",
                RPTSecret,
            );
            if (error != null) return error;
        }
        return null;
    });

export default loadObjectOf;