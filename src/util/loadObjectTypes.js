import RPTSecret from "prop-types/lib/ReactPropTypesSecret";
import LoadObject from "./LoadObject";
import LoadObjectMap from "./LoadObjectMap";
import LoadObjectState from "./LoadObjectState";
import {
    createChainableTypeChecker,
    getClassName,
    PropTypeError,
} from "./typeHelpers";

function checkLoadObject(
    lo,
    valueTypeChecker,
    location,
    propFullName,
    optionalErrorTypeChecker,
) {
    if (lo.hasValue()) {
        const error = valueTypeChecker(
            { value: lo.getValueEnforcing() },
            "value",
            "LoadObject",
            location,
            propFullName + ".value",
            RPTSecret,
        );
        if (error != null) return error;
    }
    if (optionalErrorTypeChecker != null && lo.hasError()) {
        const error = optionalErrorTypeChecker(
            { error: lo.getErrorEnforcing() },
            "error",
            "LoadObject",
            location,
            propFullName + ".error",
            RPTSecret,
        );
        if (error != null) return error;
    }
    return null;
}

export const loadObjectOf = (valueTypeChecker, optionalErrorTypeChecker) =>
    createChainableTypeChecker(
        (props, propName, componentName, location, propFullName) => {
            if (
                typeof valueTypeChecker !== "function" ||
                (optionalErrorTypeChecker != null &&
                    typeof optionalErrorTypeChecker !== "function")
            ) {
                return new PropTypeError(
                    "Property `" +
                        propFullName +
                        "` of component `" +
                        componentName +
                        "` has invalid PropType notation inside loadObjectOf.",
                );
            }
            const lo = props[propName];
            if (!(lo instanceof LoadObject)) {
                return new PropTypeError(
                    "Invalid " +
                        location +
                        " `" +
                        propFullName +
                        "` of type `" +
                        getClassName(lo) +
                        "` supplied to `" +
                        componentName +
                        "`, expected instance of `LoadObject`.",
                );
            }
            return checkLoadObject(
                lo,
                valueTypeChecker,
                location,
                propFullName,
                optionalErrorTypeChecker,
            );
        },
    );

export const loadObjectStateOf = (valueTypeChecker, optionalErrorTypeChecker) =>
    createChainableTypeChecker(
        (props, propName, componentName, location, propFullName) => {
            if (
                typeof valueTypeChecker !== "function" ||
                (optionalErrorTypeChecker != null &&
                    typeof optionalErrorTypeChecker !== "function")
            ) {
                return new PropTypeError(
                    "Property `" +
                        propFullName +
                        "` of component `" +
                        componentName +
                        "` has invalid PropType notation inside loadObjectOf.",
                );
            }
            const los = props[propName];
            if (!(los instanceof LoadObjectState)) {
                return new PropTypeError(
                    "Invalid " +
                        location +
                        " `" +
                        propFullName +
                        "` of type `" +
                        getClassName(los) +
                        "` supplied to `" +
                        componentName +
                        "`, expected instance of `LoadObjectState`.",
                );
            }
            return checkLoadObject(
                los._data, // this is rather bad form, but for validation, we need zero side effects
                valueTypeChecker,
                location,
                propFullName,
                optionalErrorTypeChecker,
            );
        },
    );

export const loadObjectMapOf = (
    keyTypeChecker,
    valueTypeChecker,
    optionalErrorTypeChecker,
) =>
    createChainableTypeChecker(
        (props, propName, componentName, location, propFullName) => {
            if (
                typeof valueTypeChecker !== "function" ||
                (optionalErrorTypeChecker != null &&
                    typeof optionalErrorTypeChecker !== "function")
            ) {
                return new PropTypeError(
                    "Property `" +
                        propFullName +
                        "` of component `" +
                        componentName +
                        "` has invalid PropType notation inside loadObjectOf.",
                );
            }
            const lom = props[propName];
            if (!(lom instanceof LoadObjectMap)) {
                return new PropTypeError(
                    "Invalid " +
                        location +
                        " `" +
                        propFullName +
                        "` of type `" +
                        getClassName(lom) +
                        "` supplied to `" +
                        componentName +
                        "`, expected instance of `LoadObjectMap`.",
                );
            }
            let error = null;
            lom.some((lo, k) => {
                error = keyTypeChecker(
                    { key: k },
                    "key",
                    "LoadObjectMap key",
                    location,
                    propFullName + " key",
                    RPTSecret,
                );
                if (error != null) return true;
                error = checkLoadObject(
                    lo,
                    valueTypeChecker,
                    location,
                    propFullName + "[" + k + "]",
                    optionalErrorTypeChecker,
                );
                return error != null;
            });
            return error;
        },
    );
