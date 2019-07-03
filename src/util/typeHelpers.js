//////////////////////////////////////////////////////////////////////
// This file is taken directly from the `prop-types` library's
// internals, so that our custom checkers can work the same as the
// standard ones. It's not ideal, but they don't expose these details
// via module exports, so we have to duplicate...
//////////////////////////////////////////////////////////////////////

const ANONYMOUS = "<<anonymous>>";

/**
 * We use an Error-like object for backward compatibility as people may call
 * PropTypes directly and inspect their output. However, we don't use real
 * Errors anymore. We don't inspect their stack anyway, and creating them
 * is prohibitively expensive if they are created too often, such as what
 * happens in oneOfType() for any type before the one that matched.
 */
export function PropTypeError(message) {
    this.message = message;
    this.stack = "";
}

// Make `instanceof Error` still work for returned errors.
PropTypeError.prototype = Error.prototype;

export function createChainableTypeChecker(validate) {
    function checkType(
        isRequired,
        props,
        propName,
        componentName,
        location,
        propFullName,
    ) {
        componentName = componentName || ANONYMOUS;
        propFullName = propFullName || propName;

        if (props[propName] == null) {
            if (isRequired) {
                if (props[propName] === null) {
                    return new PropTypeError(`The ${location} \`${propFullName}\` is marked as required in \`${componentName}\`, but its value is \`null\`.`);
                }
                return new PropTypeError(`The ${location} \`${propFullName}\` is marked as required in \`${componentName}\`, but its value is \`undefined\`.`);
            }
            return null;
        } else {
            return validate(
                props,
                propName,
                componentName,
                location,
                propFullName,
            );
        }
    }

    const chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
}

// Returns class name of the object, if any.
export  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
        return ANONYMOUS;
    }
    return propValue.constructor.name;
}
