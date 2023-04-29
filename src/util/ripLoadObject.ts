import {
    createChainableTypeChecker,
    PropTypeError,
} from "./typeHelpers";
import RPTSecret from "prop-types/lib/ReactPropTypesSecret";
import LoadObject from "./LoadObject";

export function ripLoadObject<T>(lo: LoadObject<T>) {
    return {
        loading: lo.isLoading(),
        deleting: lo.isDeleting(),
        data: lo.getValue(),
        error: lo.getError(),
    };
}

export const rippedLoadObjectOf = (dataTypeChecker, optionalErrorTypeChecker) =>
    createChainableTypeChecker((
        props,
        propName,
        componentName,
        location,
        propFullName,
    ) => {
        if (typeof dataTypeChecker !== "function" || (optionalErrorTypeChecker != null && typeof optionalErrorTypeChecker !== "function")) {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside rippedLoadObjectOf.");
        }
        const rippedLO = props[propName];
        if (dataTypeChecker && rippedLO.data) {
            const error = dataTypeChecker(
                rippedLO,
                "data",
                "RippedLoadObject",
                location,
                propFullName + ".data",
                RPTSecret,
            );
            if (error != null) return error;
        }
        if (optionalErrorTypeChecker != null && rippedLO.error) {
            const error = optionalErrorTypeChecker(
                rippedLO,
                "error",
                "RippedLoadObject",
                location,
                propFullName + ".error",
                RPTSecret,
            );
            if (error != null) return error;
        }
        return null;
    });
